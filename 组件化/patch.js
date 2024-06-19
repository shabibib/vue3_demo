
// 当父组件的title变化时，触发patch，触发patchComponent -> 子组件的被动更新
function patch(n1, n2, container, anchor) {
    if(n1 && n1.type !== n2.type) {
        unmount(n1)
        n1 = null
    }

    const { type } = n2

    if(typeof type === 'string') {

    } else if(type === Text) {

    } else if(type === Fragment) {

    } else if(typeof type === 'object') {
        if(!n1) {
            mountComponent(n2, container, anchor)
        } else {
            patchComponent(n1, n2, anchor)
        }
    }
}