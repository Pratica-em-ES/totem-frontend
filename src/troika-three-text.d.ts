// So para remover uns erros irritantes, porem irrelevantes, que aparecem no editor
declare module 'troika-three-text' {
    import { Object3D, BufferGeometry, Box3 } from 'three'

    export class Text extends Object3D {
        // text content
        text: string
        // style
        fontSize: number
        color: number | string
        outlineWidth?: number
        outlineColor?: number | string
        // visibility
        visible: boolean
        // geometry access (very small surface of the real API)
        geometry: BufferGeometry & { boundingBox: Box3 }

        // sync callback invoked when text layout is ready
        sync(cb?: () => void): void

        // constructor
        constructor()
    }

    export default Text
}
