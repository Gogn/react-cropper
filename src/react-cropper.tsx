import React, {useState, useEffect} from 'react';
import Cropper from 'cropperjs';

export interface ReactCropperProps
    extends Cropper.Options,
        Omit<React.HTMLProps<HTMLImageElement>, 'data' | 'ref' | 'crossOrigin'> {
    crossOrigin?: '' | 'anonymous' | 'use-credentials' | undefined;
    on?: (eventName: string, callback: () => void | Promise<void>) => void | Promise<void>;
    scaleX?: number;
    scaleY?: number;
    enable?: boolean;
    zoomTo?: number;
    rotateTo?: number;
    onInitialized?: (instance: Cropper) => void | Promise<void>;
}

const ReactCropper: React.FC<ReactCropperProps> = (props) => {
    const {
        dragMode = 'crop',
        src,
        style,
        className,
        crossOrigin,
        scaleX = 1,
        scaleY = 1,
        enable = true,
        zoomTo = 1,
        rotateTo = 0,
        alt = 'picture',
        ready,
        onInitialized,
        ...rest
    } = props;
    const [cropper, setCropper] = useState<Cropper | undefined>(undefined);
    const imageRef = React.createRef<HTMLImageElement>();
    const defaultOptions = (e: CustomEvent<unknown>) => {
        if (e.target !== null) {
            const target = e.target as any;
            enable ? target.cropper.enable() : target.cropper.disable();
            target.cropper.scaleX(scaleX);
            target.cropper.scaleY(scaleY);
            target.cropper.rotateTo(rotateTo);
            target.cropper.zoomTo(zoomTo);
        }
    };

    useEffect(() => {
        if (imageRef.current !== null && imageRef.current.src) {
            const cropper = new Cropper(imageRef.current, {
                dragMode,
                ...rest,
                ready: (e) => {
                    defaultOptions(e);
                    ready && ready(e);
                },
            });
            onInitialized && onInitialized(cropper);
            setCropper(cropper);
        }

        /**
         * destroy cropper on un-mount
         */
        return () => {
            if (imageRef.current !== null) {
                cropper?.destroy();
            }
        };
    }, [imageRef.current]);

    /**
     * re-render when src changes
     */
    useEffect(() => {
        if (typeof cropper !== 'undefined' && typeof src !== 'undefined') {
            cropper.reset().clear().replace(src);
        }
    }, [src]);

    return (
        <div style={style} className={className}>
            <img crossOrigin={crossOrigin} src={src} alt={alt} style={{opacity: 0, maxWidth: '100%'}} ref={imageRef} />
        </div>
    );
};

export {ReactCropper as Cropper};
export default ReactCropper;
