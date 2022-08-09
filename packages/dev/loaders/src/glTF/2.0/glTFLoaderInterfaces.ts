﻿import type { AnimationGroup } from "core/Animations/animationGroup";
import type { Skeleton } from "core/Bones/skeleton";
import type { Material } from "core/Materials/material";
import type { TransformNode } from "core/Meshes/transformNode";
import type { Buffer, VertexBuffer } from "core/Buffers/buffer";
import type { AbstractMesh } from "core/Meshes/abstractMesh";
import type { Mesh } from "core/Meshes/mesh";
import type { Camera } from "core/Cameras/camera";
import type { Light } from "core/Lights/light";

import type * as GLTF2 from "babylonjs-gltf2interface";

/**
 * Loader interface with an index field.
 */
export interface IArrayItem {
    /**
     * The index of this item in the array.
     */
    index: number;
}

/**
 * Loader interface with additional members.
 */
export interface IAccessor extends GLTF2.IAccessor, IArrayItem {
    /** @hidden */
    _data?: Promise<ArrayBufferView>;

    /** @hidden */
    _babylonVertexBuffer?: { [kind: string]: Promise<VertexBuffer> };
}

/**
 * Loader interface with additional members.
 */
export interface IAnimationChannel extends GLTF2.IAnimationChannel, IArrayItem {}

/** @hidden */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface _IAnimationSamplerData {
    input: Float32Array;
    interpolation: GLTF2.AnimationSamplerInterpolation;
    output: Float32Array;
}

/**
 * Loader interface with additional members.
 */
export interface IAnimationSampler extends GLTF2.IAnimationSampler, IArrayItem {
    /** @hidden */
    _data?: Promise<_IAnimationSamplerData>;
}

/**
 * Loader interface with additional members.
 */
export interface IAnimation extends GLTF2.IAnimation, IArrayItem {
    channels: IAnimationChannel[];
    samplers: IAnimationSampler[];

    /** @hidden */
    _babylonAnimationGroup?: AnimationGroup;
}

/**
 * Loader interface with additional members.
 */
export interface IBuffer extends GLTF2.IBuffer, IArrayItem {
    /** @hidden */
    _data?: Promise<ArrayBufferView>;
}

/**
 * Loader interface with additional members.
 */
export interface IBufferView extends GLTF2.IBufferView, IArrayItem {
    /** @hidden */
    _data?: Promise<ArrayBufferView>;

    /** @hidden */
    _babylonBuffer?: Promise<Buffer>;
}

/**
 * Loader interface with additional members.
 */
export interface IKHRLight extends GLTF2.IKHRLightsPunctual_Light {
    /** @hidden */
    _babylonLight: Light;
}

/**
 * Loader interface with additional members.
 */
export interface ICamera extends GLTF2.ICamera, IArrayItem {
    /** @hidden */
    _babylonCamera: Camera;
}

/**
 * Loader interface with additional members.
 */
export interface IImage extends GLTF2.IImage, IArrayItem {
    /** @hidden */
    _data?: Promise<ArrayBufferView>;
}

/**
 * Loader interface with additional members.
 */
export interface IMaterialNormalTextureInfo extends GLTF2.IMaterialNormalTextureInfo, ITextureInfo {}

/**
 * Loader interface with additional members.
 */
export interface IMaterialOcclusionTextureInfo extends GLTF2.IMaterialOcclusionTextureInfo, ITextureInfo {}

/**
 * Loader interface with additional members.
 */
export interface IMaterialPbrMetallicRoughness extends GLTF2.IMaterialPbrMetallicRoughness {
    baseColorTexture?: ITextureInfo;
    metallicRoughnessTexture?: ITextureInfo;
}

/**
 * Loader interface with additional members.
 */
export interface IMaterial extends GLTF2.IMaterial, IArrayItem {
    pbrMetallicRoughness?: IMaterialPbrMetallicRoughness;
    normalTexture?: IMaterialNormalTextureInfo;
    occlusionTexture?: IMaterialOcclusionTextureInfo;
    emissiveTexture?: ITextureInfo;

    /** @hidden */
    _data?: {
        [babylonDrawMode: number]: {
            babylonMaterial: Material;
            babylonMeshes: AbstractMesh[];
            promise: Promise<void>;
        };
    };
}

/**
 * Loader interface with additional members.
 */
export interface IMesh extends GLTF2.IMesh, IArrayItem {
    primitives: IMeshPrimitive[];
}

/**
 * Loader interface with additional members.
 */
export interface IMeshPrimitive extends GLTF2.IMeshPrimitive, IArrayItem {
    /** @hidden */
    _instanceData?: {
        babylonSourceMesh: Mesh;
        promise: Promise<any>;
    };
}

/**
 * Loader interface with additional members.
 */
export interface INode extends GLTF2.INode, IArrayItem {
    /**
     * The parent glTF node.
     */
    parent?: INode;

    /** @hidden */
    _babylonTransformNode?: TransformNode;

    /** @hidden */
    _babylonTransformNodeForSkin?: TransformNode;

    /** @hidden */
    _primitiveBabylonMeshes?: AbstractMesh[];

    /** @hidden */
    _numMorphTargets?: number;
}

/** @hidden */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface _ISamplerData {
    noMipMaps: boolean;
    samplingMode: number;
    wrapU: number;
    wrapV: number;
}

/**
 * Loader interface with additional members.
 */
export interface ISampler extends GLTF2.ISampler, IArrayItem {
    /** @hidden */
    _data?: _ISamplerData;
}

/**
 * Loader interface with additional members.
 */
export interface IScene extends GLTF2.IScene, IArrayItem {}

/**
 * Loader interface with additional members.
 */
export interface ISkin extends GLTF2.ISkin, IArrayItem {
    /** @hidden */
    _data?: {
        babylonSkeleton: Skeleton;
        promise: Promise<void>;
    };
}

/**
 * Loader interface with additional members.
 */
export interface ITexture extends GLTF2.ITexture, IArrayItem {
    /** @hidden */
    _textureInfo: ITextureInfo;
}

/**
 * Loader interface with additional members.
 */
export interface ITextureInfo extends GLTF2.ITextureInfo {
    /** false or undefined if the texture holds color data (true if data are roughness, normal, ...) */
    nonColorData?: boolean;
}

/**
 * Loader interface with additional members.
 */
export interface IGLTF extends GLTF2.IGLTF {
    accessors?: IAccessor[];
    animations?: IAnimation[];
    buffers?: IBuffer[];
    bufferViews?: IBufferView[];
    cameras?: ICamera[];
    images?: IImage[];
    materials?: IMaterial[];
    meshes?: IMesh[];
    nodes?: INode[];
    samplers?: ISampler[];
    scenes?: IScene[];
    skins?: ISkin[];
    textures?: ITexture[];
}
