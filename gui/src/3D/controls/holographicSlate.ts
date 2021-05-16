import { AbstractMesh } from "babylonjs/Meshes/abstractMesh";
import { Scene } from "babylonjs/scene";
import { TransformNode } from "babylonjs/Meshes/transformNode";
import { Color3 } from "babylonjs/Maths/math.color";
import { BoxBuilder } from "babylonjs/Meshes/Builders/boxBuilder";
import { Mesh } from "babylonjs/Meshes/mesh";
import { FluentMaterial } from "../materials/fluent/fluentMaterial";
import { TouchHolographicButton } from "./touchHolographicButton";
import { Nullable } from "babylonjs/types";
import { Observer } from "babylonjs/Misc/observable";
import { Matrix, Quaternion, Vector2, Vector3 } from "babylonjs/Maths/math.vector";
import { Control3D } from "./control3D";
import { ContentDisplay3D } from "./contentDisplay3D";
import { AdvancedDynamicTexture } from "../../2D/advancedDynamicTexture";
import { Image } from "../../2D/controls/image";
import { SlateGizmo } from "../gizmos/slateGizmo";
import { DefaultBehavior } from "../behaviors/defaultBehavior";
import { Viewport } from "babylonjs/Maths/math.viewport";
import { PointerDragBehavior } from "babylonjs/Behaviors/Meshes/pointerDragBehavior";
import { Scalar } from "babylonjs/Maths/math.scalar";
import { Texture } from "babylonjs/Materials/Textures/texture";

/**
 * Class used to create a holographic slate
 */
export class HolographicSlate extends ContentDisplay3D {
    /**
     * Base Url for the assets.
     */
    public static ASSETS_BASE_URL: string = "https://assets.babylonjs.com/meshes/MRTK/";
    /**
     * File name for the close icon.
     */
    public static CLOSE_ICON_FILENAME: string = "IconClose.png";
    /**
     * File name for the close icon.
     */
    public static FOLLOW_ICON_FILENAME: string = "IconFollowMe.png";

    /**
     * Dimensions of the slate
     */
    public dimensions = new Vector3(5, 3, 0.04);

    /**
     * Minimum dimensions of the slate
     */
    public minDimensions = new Vector3(3, 1.5, 0.04);

    /**
     * Dimensions of the backplate
     */
    public backplateDimensions = new Vector3(5, 0.3, 0.04);

    /**
     * Margin between backplate and contentplate
     */
    public backPlateMargin = 0.05;

    /**
     * Origin in local coordinates (top left corner)
     */
    public origin = new Vector3(0, 0, 0);

    private _backPlateMaterial: FluentMaterial;
    private _contentMaterial: FluentMaterial;
    private _pickedPointObserver: Nullable<Observer<Nullable<Vector3>>>;
    private _imageUrl: string;

    private _contentViewport: Viewport;
    private _contentDragBehavior: PointerDragBehavior;

    /** @hidden */
    public _defaultBehavior: DefaultBehavior;
    /** @hidden */
    public _gizmo: SlateGizmo;

    protected _backPlate: Mesh;
    protected _contentPlate: Mesh;
    protected _followButton: TouchHolographicButton;
    protected _closeButton: TouchHolographicButton;
    protected _contentScaleRatio = 1;

    /**
     * Rendering ground id of all the mesh in the button
     */
    public set renderingGroupId(id: number) {
        this._backPlate.renderingGroupId = id;
        this._contentPlate.renderingGroupId = id;
    }
    public get renderingGroupId(): number {
        return this._backPlate.renderingGroupId;
    }

    /**
     * Gets or sets the image url for the button
     */
    public get imageUrl(): string {
        return this._imageUrl;
    }

    public set imageUrl(value: string) {
        if (this._imageUrl === value) {
            return;
        }

        this._imageUrl = value;
        this._rebuildContent();
        this._resetContentPositionAndZoom();
        this._applyContentViewport();
    }

    /**
     * Creates a new slate
     * @param name defines the control name
     */
    constructor(name?: string) {
        super(name);

        this._followButton = new TouchHolographicButton("followButton" + this.name);
        this._closeButton = new TouchHolographicButton("closeButton" + this.name);

        this._contentViewport = new Viewport(0, 0, 1, 1);
        this._contentDragBehavior = new PointerDragBehavior({
            dragPlaneNormal: new Vector3(0, 0, -1),
        });
    }

    /**
     * Apply the facade texture (created from the content property).
     * This function can be overloaded by child classes
     * @param facadeTexture defines the AdvancedDynamicTexture to use
     */
    protected _applyFacade(facadeTexture: AdvancedDynamicTexture) {
        this._contentMaterial.albedoTexture = facadeTexture;
    }

    private _rebuildContent(): void {
        this._disposeFacadeTexture();
        // HACK: Temporary fix for BabylonNative while we wait for the polyfill.
        if (!!document.createElement) {
            if (this._imageUrl) {
                let image = new Image();
                image.source = this._imageUrl;

                if (this._contentPlate) {
                    this.content = image;
                }
            }
        }
    }

    private _addControl(control: Control3D): void {
        control._host = this._host;
        if (this._host.utilityLayer) {
            control._prepareNode(this._host.utilityLayer.utilityLayerScene);
        }
    }

    protected _getTypeName(): string {
        return "HolographicSlate";
    }

    /**
     * @hidden
     */
    public _positionElements() {
        const followButtonMesh = this._followButton.mesh;
        const closeButtonMesh = this._closeButton.mesh;
        const backPlate = this._backPlate;
        const contentPlate = this._contentPlate;

        if (followButtonMesh && closeButtonMesh && backPlate) {
            // World size of a button with 1 scaling
            const buttonBaseSize = 1;

            // Buttons take full backPlate on Y axis
            const backPlateYScale = this.backplateDimensions.y / buttonBaseSize;

            closeButtonMesh.scaling.setAll(backPlateYScale);
            followButtonMesh.scaling.setAll(backPlateYScale);
            closeButtonMesh.position
                .copyFromFloats(
                    this.backplateDimensions.x - backPlateYScale / 2,
                    -this.backplateDimensions.y / 2,
                    (-this.backplateDimensions.z / 2) * (this._host.scene.useRightHandedSystem ? -1 : 1)
                )
                .addInPlace(this.origin);
            followButtonMesh.position
                .copyFromFloats(
                    this.backplateDimensions.x - (3 * backPlateYScale) / 2,
                    -this.backplateDimensions.y / 2,
                    (-this.backplateDimensions.z / 2) * (this._host.scene.useRightHandedSystem ? -1 : 1)
                )
                .addInPlace(this.origin);

            const contentPlateHeight = this.dimensions.y - this.backplateDimensions.y - this.backPlateMargin;
            backPlate.scaling.copyFrom(this.backplateDimensions);
            contentPlate.scaling.copyFromFloats(this.dimensions.x, contentPlateHeight, this.dimensions.z);
            backPlate.position.copyFromFloats(this.backplateDimensions.x / 2, -(this.backplateDimensions.y / 2), 0).addInPlace(this.origin);
            contentPlate.position.copyFromFloats(this.dimensions.x / 2, -(this.backplateDimensions.y + this.backPlateMargin + contentPlateHeight / 2), 0).addInPlace(this.origin);

            const aspectRatio = this.dimensions.x / contentPlateHeight;
            this._contentViewport.width = this._contentScaleRatio;
            this._contentViewport.height = this._contentScaleRatio / aspectRatio;

            this._applyContentViewport();
        }
    }

    private _applyContentViewport() {
        if (this._contentPlate.material && (this._contentPlate.material as FluentMaterial).albedoTexture) {
            const tex = (this._contentPlate.material as FluentMaterial).albedoTexture as Texture;
            tex.uScale = this._contentScaleRatio;
            tex.vScale = this._contentScaleRatio / this._contentViewport.width * this._contentViewport.height;
            tex.uOffset = this._contentViewport.x;
            tex.vOffset = this._contentViewport.y;
        }
    }

    private _resetContentPositionAndZoom() {
        this._contentViewport.x = 0;
        this._contentViewport.y = 1 - this._contentViewport.height / this._contentViewport.width;
        this._contentScaleRatio = 1;
    }

    /**
     * @hidden
     */
    public _updatePivot() {
        if (!this.mesh) {
            return;
        }

        // Update pivot point so it is at the center of geometry
        const center = this.dimensions.scale(0.5);
        // As origin is topleft corner in 2D, dimensions are calculated towards bottom right corner, thus y axis is downwards
        center.y *= -1;
        center.addInPlace(this.origin);
        center.z = 0;

        const origin = new Vector3(0, 0, 0);
        Vector3.TransformCoordinatesToRef(origin, this.mesh.computeWorldMatrix(true), origin);
        this.mesh.setPivotPoint(center);
        const origin2 = new Vector3(0, 0, 0);
        Vector3.TransformCoordinatesToRef(origin2, this.mesh.computeWorldMatrix(true), origin2);
        this.mesh.position.addInPlace(origin).subtractInPlace(origin2);
    }

    // Mesh association
    protected _createNode(scene: Scene): TransformNode {
        const node = new Mesh("slate" + this.name);

        this._backPlate = BoxBuilder.CreateBox("backPlate" + this.name, { size: 1 }, scene);
        this._contentPlate = BoxBuilder.CreateBox("contentPlate" + this.name, { size: 1 }, scene);

        this._backPlate.parent = node;
        this._contentPlate.parent = node;
        this._attachContentPlateBehavior();

        this._addControl(this._followButton);
        this._addControl(this._closeButton);

        const followButtonMesh = this._followButton.mesh!;
        const closeButtonMesh = this._closeButton.mesh!;
        followButtonMesh.parent = node;
        closeButtonMesh.parent = node;

        this._positionElements();

        this._followButton.imageUrl = HolographicSlate.ASSETS_BASE_URL + HolographicSlate.FOLLOW_ICON_FILENAME;
        this._closeButton.imageUrl = HolographicSlate.ASSETS_BASE_URL + HolographicSlate.CLOSE_ICON_FILENAME;

        this._followButton.backMaterial.alpha = 0;
        this._closeButton.backMaterial.alpha = 0;

        this._followButton.onPointerClickObservable.add(() => {
            this._defaultBehavior.followBehaviorEnabled = !this._defaultBehavior.followBehaviorEnabled;
            if (this._defaultBehavior.followBehaviorEnabled) {
                this._defaultBehavior.followBehavior.recenter();
            }
        });

        this._closeButton.onPointerClickObservable.add(() => {
            this.dispose();
        });

        node.rotationQuaternion = Quaternion.Identity();
        node.isVisible = false;

        // By default the slate spawns in front of the camera
        // TODO : add a parameter
        if (scene.activeCamera) {
            const worldMatrix = scene.activeCamera.getWorldMatrix();
            const backward = Vector3.TransformNormal(new Vector3(0, 0, -1), worldMatrix);
            node.position.copyFrom(scene.activeCamera.position).subtractInPlace(backward.scale(2));
            node.rotationQuaternion = Quaternion.FromLookDirectionLH(backward, new Vector3(0, 1, 0));
            node.scaling.setAll(0.2);
        }

        return node;
    }

    private _attachContentPlateBehavior() {
        this._contentDragBehavior.attach(this._contentPlate);
        this._contentDragBehavior.moveAttached = false;
        this._contentDragBehavior.useObjectOrientationForDragging = true;
        this._contentDragBehavior.updateDragPlane = false;

        let origin = new Vector3();
        let startViewport: Viewport;
        let worldDimensions = new Vector3();
        let upWorld = new Vector3();
        let rightWorld = new Vector3();
        let projectedOffset = new Vector2();
        let worldMatrix: Matrix;

        this._contentDragBehavior.onDragStartObservable.add((event) => {
            if (!this.node) {
                return;
            }
            startViewport = this._contentViewport.clone();
            worldMatrix = this.node.computeWorldMatrix(true);

            origin.copyFrom(event.dragPlanePoint);
            worldDimensions.copyFrom(this.dimensions);
            worldDimensions.y -= this.backplateDimensions.y + this.backPlateMargin;
            Vector3.TransformNormalToRef(worldDimensions, worldMatrix, worldDimensions);
            upWorld.copyFromFloats(0, 1, 0);
            Vector3.TransformNormalToRef(upWorld, worldMatrix, upWorld);
            rightWorld.copyFromFloats(1, 0, 0);
            Vector3.TransformNormalToRef(rightWorld, worldMatrix, rightWorld);
            upWorld.normalize();
            upWorld.scaleInPlace(1 / Vector3.Dot(upWorld, worldDimensions));
            rightWorld.normalize();
            rightWorld.scaleInPlace(1 / Vector3.Dot(rightWorld, worldDimensions))
        });

        let offset = new Vector3();
        this._contentDragBehavior.onDragObservable.add((event) => {
            offset.copyFrom(event.dragPlanePoint);
            offset.subtractInPlace(origin);
            projectedOffset.copyFromFloats(Vector3.Dot(offset, rightWorld), Vector3.Dot(offset, upWorld));

            // By default, content takes full width available and height is cropped to keep aspect ratio
            this._contentViewport.x = Scalar.Clamp(startViewport.x - offset.x, 0, 1 - this._contentViewport.width * this._contentScaleRatio);
            this._contentViewport.y = Scalar.Clamp(startViewport.y - offset.y, 0, 1 - this._contentViewport.height * this._contentScaleRatio);
            this._applyContentViewport();
        });
    }

    protected _affectMaterial(mesh: AbstractMesh) {
        // TODO share materials
        this._backPlateMaterial = new FluentMaterial(this.name + "plateMaterial", mesh.getScene());
        this._backPlateMaterial.albedoColor = new Color3(0.08, 0.15, 0.55);
        this._backPlateMaterial.renderBorders = true;
        this._backPlateMaterial.renderHoverLight = true;

        this._pickedPointObserver = this._host.onPickedPointChangedObservable.add((pickedPoint) => {
            if (pickedPoint) {
                this._backPlateMaterial.hoverPosition = pickedPoint;
                this._backPlateMaterial.hoverColor.a = 1.0;
            } else {
                this._backPlateMaterial.hoverColor.a = 0;
            }
        });

        this._contentMaterial = new FluentMaterial(this.name + "contentMaterial", mesh.getScene());
        this._contentMaterial.renderBorders = true;

        this._backPlate.material = this._backPlateMaterial;
        this._contentPlate.material = this._contentMaterial;

        this._rebuildContent();
        this._applyContentViewport();
    }

    /** @hidden **/
    public _prepareNode(scene: Scene): void {
        super._prepareNode(scene);
        this._gizmo = new SlateGizmo(this._host.utilityLayer!);
        this._gizmo.attachedSlate = this;
        this._defaultBehavior = new DefaultBehavior();
        this._defaultBehavior.attach(this.node as Mesh, this._backPlate);

        this._updatePivot();
    }

    /**
     * Releases all associated resources
     */
    public dispose() {
        super.dispose();
        this._backPlateMaterial.dispose();
        this._contentMaterial.dispose();

        this._backPlate.dispose();
        this._contentPlate.dispose();

        this._followButton.dispose();
        this._closeButton.dispose();

        if (this._pickedPointObserver) {
            this._host.onPickedPointChangedObservable.remove(this._pickedPointObserver);
            this._pickedPointObserver = null;
        }

        this._defaultBehavior.detach();
        this._gizmo.dispose();
        this._contentDragBehavior.detach();
    }
}
