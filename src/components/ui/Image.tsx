import React from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  imageClassName?: string;
}

function Image({
  src,
  className,
  imageClassName,
  alt,
  ...rest
}: Readonly<ImageProps>) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <img
        src={src}
        className={`max-h-full h-full w-auto object-cover ${imageClassName}`}
        alt={alt}
        {...rest}
      ></img>
    </div>
  );
}

export default Image;
