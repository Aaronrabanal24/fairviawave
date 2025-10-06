import React from "react";
export default function Link(props: any) {
  const { href, children, ...rest } = props;
  return <a href={href} {...rest}>{children}</a>;
}
