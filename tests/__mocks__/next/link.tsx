import React from 'react'

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, children, ...props }, ref) =>
    React.createElement('a', { href, ref, ...props }, children)
)

Link.displayName = 'NextLinkMock'

export default Link
