// 最小 React 替身：只要 createElement，够图标层用。
export const createElement = (type, props, ...children) => ({
  type,
  props: { ...(props ?? {}), children: children.length > 1 ? children : children[0] },
})
