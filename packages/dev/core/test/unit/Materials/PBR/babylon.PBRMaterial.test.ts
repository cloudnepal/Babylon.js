import type { Engine } from "core/Engines";
import { NullEngine } from "core/Engines";
import { PBRMaterial, Texture } from "core/Materials";
import { PrePassRenderer } from "core/Rendering";
import "core/Rendering/prePassRendererSceneComponent";
import "core/Rendering/subSurfaceSceneComponent";
import { Scene } from "core/scene";

describe("PBRMaterial", () => {
    let subject: Engine;
    let scene: Scene;

    beforeEach(() => {
        subject = new NullEngine({
            renderHeight: 256,
            renderWidth: 256,
            textureSize: 256,
            deterministicLockstep: false,
            lockstepMaxSteps: 1,
        });
        scene = new Scene(subject);
    });

    describe("hasTexture", () => {
        let material: PBRMaterial;
        let texture: Texture;

        beforeEach(() => {
            material = new PBRMaterial("mat", scene);
            texture = new Texture("texture.jpg", scene);
        });

        it("should return false when texture not defined", () => {
            expect(material.hasTexture(texture)).toEqual(false);
        });

        it("should return true when albedo texture is defined", () => {
            material.albedoTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when ambient texture is defined", () => {
            material.ambientTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when opacity texture is defined", () => {
            material.opacityTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when reflection texture is defined", () => {
            material.reflectionTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when emissive texture is defined", () => {
            material.emissiveTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when reflectivity texture is defined", () => {
            material.reflectivityTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when metallic texture is defined", () => {
            material.metallicTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when metallic reflection texture is defined", () => {
            material.metallicReflectanceTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when reflectance texture is defined", () => {
            material.reflectanceTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when microsurface texture is defined", () => {
            material.microSurfaceTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when bump texture is defined", () => {
            material.bumpTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when lightmap texture is defined", () => {
            material.lightmapTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });

        it("should return true when refraction texture is defined", () => {
            material.refractionTexture = texture;
            expect(material.hasTexture(texture)).toEqual(true);
        });
    });

    describe("setPrePassRenderer", () => {
        let material: PBRMaterial;

        beforeEach(() => {
            material = new PBRMaterial("mat", scene);
        });

        it("should scene prePassRenderer be disabled by default", () => {
            expect(scene.prePassRenderer).toBeUndefined();
        });

        it("should set prepass renderer when scattering enable", () => {
            material.subSurface.isScatteringEnabled = true;
            material.setPrePassRenderer();

            expect(scene.prePassRenderer).toBeDefined();
        });

        it("should not set prepass renderer when refraction disabled", () => {
            material.subSurface.isScatteringEnabled = false;
            material.setPrePassRenderer();

            expect(scene.prePassRenderer).toBeUndefined();
        });

        it("should enable subSurfaceConfiguration when PrePassRenderer supported (WebGL2)", () => {
            expect(scene.subSurfaceConfiguration?.enabled).toBeFalsy();

            jest.spyOn(PrePassRenderer.prototype, "isSupported", "get").mockReturnValue(true);

            material.subSurface.isScatteringEnabled = true;
            material.setPrePassRenderer();

            expect(scene.subSurfaceConfiguration?.enabled).toBeTruthy();
        });
    });

    describe("dispose", () => {
        let material: PBRMaterial;

        beforeEach(() => {
            material = new PBRMaterial("mat", scene);
        });

        describe("textures disposal", () => {
            let albedoTextureDisposeSpy: jest.SpyInstance<void, []>;
            let ambientTextureDisposeSpy: jest.SpyInstance<void, []>;
            let opacityTextureDisposeSpy: jest.SpyInstance<void, []>;
            let reflectionTextureDisposeSpy: jest.SpyInstance<void, []>;
            let emissiveTextureDisposeSpy: jest.SpyInstance<void, []>;
            let reflectivityTextureDisposeSpy: jest.SpyInstance<void, []>;
            let metallicTextureDisposeSpy: jest.SpyInstance<void, []>;
            let metallicReflectanceTextureDisposeSpy: jest.SpyInstance<void, []>;
            let reflectanceTextureDisposeSpy: jest.SpyInstance<void, []>;
            let microSurfaceTextureDisposeSpy: jest.SpyInstance<void, []>;
            let bumpTextureDisposeSpy: jest.SpyInstance<void, []>;
            let lightmapTextureDisposeSpy: jest.SpyInstance<void, []>;
            let refractionTextureDisposeSpy: jest.SpyInstance<void, []>;

            beforeEach(() => {
                material.albedoTexture = new Texture("texture.jpg", scene);
                albedoTextureDisposeSpy = jest.spyOn(material.albedoTexture, "dispose");

                material.ambientTexture = new Texture("texture.jpg", scene);
                ambientTextureDisposeSpy = jest.spyOn(material.ambientTexture, "dispose");

                material.opacityTexture = new Texture("texture.jpg", scene);
                opacityTextureDisposeSpy = jest.spyOn(material.opacityTexture, "dispose");

                material.reflectionTexture = new Texture("texture.jpg", scene);
                reflectionTextureDisposeSpy = jest.spyOn(material.reflectionTexture, "dispose");

                material.emissiveTexture = new Texture("texture.jpg", scene);
                emissiveTextureDisposeSpy = jest.spyOn(material.emissiveTexture, "dispose");

                material.reflectivityTexture = new Texture("texture.jpg", scene);
                reflectivityTextureDisposeSpy = jest.spyOn(material.reflectivityTexture, "dispose");

                material.metallicTexture = new Texture("texture.jpg", scene);
                metallicTextureDisposeSpy = jest.spyOn(material.metallicTexture, "dispose");

                material.metallicReflectanceTexture = new Texture("texture.jpg", scene);
                metallicReflectanceTextureDisposeSpy = jest.spyOn(material.metallicReflectanceTexture, "dispose");

                material.reflectanceTexture = new Texture("texture.jpg", scene);
                reflectanceTextureDisposeSpy = jest.spyOn(material.reflectanceTexture, "dispose");

                material.microSurfaceTexture = new Texture("texture.jpg", scene);
                microSurfaceTextureDisposeSpy = jest.spyOn(material.microSurfaceTexture, "dispose");

                material.bumpTexture = new Texture("texture.jpg", scene);
                bumpTextureDisposeSpy = jest.spyOn(material.bumpTexture, "dispose");

                material.lightmapTexture = new Texture("texture.jpg", scene);
                lightmapTextureDisposeSpy = jest.spyOn(material.lightmapTexture, "dispose");

                material.refractionTexture = new Texture("texture.jpg", scene);
                refractionTextureDisposeSpy = jest.spyOn(material.refractionTexture, "dispose");
            });

            it("should dispose all textures", () => {
                material.dispose(true, true);

                expect(albedoTextureDisposeSpy).toBeCalledTimes(1);
                expect(ambientTextureDisposeSpy).toBeCalledTimes(1);
                expect(opacityTextureDisposeSpy).toBeCalledTimes(1);
                expect(reflectionTextureDisposeSpy).toBeCalledTimes(1);
                expect(emissiveTextureDisposeSpy).toBeCalledTimes(1);
                expect(reflectivityTextureDisposeSpy).toBeCalledTimes(1);
                expect(metallicTextureDisposeSpy).toBeCalledTimes(1);
                expect(metallicReflectanceTextureDisposeSpy).toBeCalledTimes(1);
                expect(reflectanceTextureDisposeSpy).toBeCalledTimes(1);
                expect(microSurfaceTextureDisposeSpy).toBeCalledTimes(1);
                expect(bumpTextureDisposeSpy).toBeCalledTimes(1);
                expect(lightmapTextureDisposeSpy).toBeCalledTimes(1);
                expect(refractionTextureDisposeSpy).toBeCalledTimes(1);
            });

            it("should not dispose textures when forceDisposeTextures is false", () => {
                material.dispose(true, false);

                expect(albedoTextureDisposeSpy).toBeCalledTimes(0);
                expect(ambientTextureDisposeSpy).toBeCalledTimes(0);
                expect(opacityTextureDisposeSpy).toBeCalledTimes(0);
                expect(reflectionTextureDisposeSpy).toBeCalledTimes(0);
                expect(emissiveTextureDisposeSpy).toBeCalledTimes(0);
                expect(reflectivityTextureDisposeSpy).toBeCalledTimes(0);
                expect(metallicTextureDisposeSpy).toBeCalledTimes(0);
                expect(metallicReflectanceTextureDisposeSpy).toBeCalledTimes(0);
                expect(reflectanceTextureDisposeSpy).toBeCalledTimes(0);
                expect(microSurfaceTextureDisposeSpy).toBeCalledTimes(0);
                expect(bumpTextureDisposeSpy).toBeCalledTimes(0);
                expect(lightmapTextureDisposeSpy).toBeCalledTimes(0);
                expect(refractionTextureDisposeSpy).toBeCalledTimes(0);
            });
        });

        it("should not dispose environment BRDF texture if it used as environment texture in the scene", () => {
            const texture = new Texture("texture.jpg", scene);

            scene.environmentBRDFTexture = texture;
            material.environmentBRDFTexture = texture;

            const environmentTextureDisposeSpy = jest.spyOn(material.environmentBRDFTexture, "dispose");
            const textureDisposeSpy = jest.spyOn(texture, "dispose");

            material.dispose(true, true);

            expect(environmentTextureDisposeSpy).toBeCalledTimes(0);
            expect(textureDisposeSpy).toBeCalledTimes(0);
        });

        it("should dispose environment BRDF texture if it not used as environment texture in the scene", () => {
            const texture = new Texture("texture.jpg", scene);

            material.environmentBRDFTexture = texture;

            const environmentTextureDisposeSpy = jest.spyOn(material.environmentBRDFTexture, "dispose");
            const textureDisposeSpy = jest.spyOn(texture, "dispose");

            material.dispose(true, true);

            expect(environmentTextureDisposeSpy).toBeCalledTimes(1);
            expect(textureDisposeSpy).toBeCalledTimes(1);
        });

        it("should not dispose environment BRDF texture if it used as environment texture in the scene and forceDisposeTextures is false", () => {
            const texture = new Texture("texture.jpg", scene);

            scene.environmentBRDFTexture = texture;
            material.environmentBRDFTexture = texture;

            const environmentTextureDisposeSpy = jest.spyOn(material.environmentBRDFTexture, "dispose");
            const textureDisposeSpy = jest.spyOn(texture, "dispose");

            material.dispose(true, false);

            expect(environmentTextureDisposeSpy).toBeCalledTimes(0);
            expect(textureDisposeSpy).toBeCalledTimes(0);
        });
    });
});
