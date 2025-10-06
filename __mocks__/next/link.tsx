import React from "react";
export default function Link(props: any) {
  const { href, children, ...rest } = props;
  return React.createElement('a', { href, ...rest }, children);
}
