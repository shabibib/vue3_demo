import queueJob from './queueJob.js'
import { resolveProps, hasPropsChanged } from './props.js'

const MyComponent = {
    name: 'MyComponent',
    data() {
        return {
            foo: 1
        }
    },
    props: {
        title: String,
    },
    render() {
        return {
            type: 'div',
            children: `foo is ${this.foo}, title is ${this.title}`
        }
    }
}

const vnode = {
    type: MyComponent,
    props: {
        title: 'A big title'
    },
}
render.render(vnode, document.querySelector('#app'))


function mountComponent(vnode, container, anchor) {
    const componentOptions = vnode.type
    const { render, data, beforeCreate, created, beforeMount, mounted, beforeUpdate, updated, props: propsOption } = componentOptions
    beforeCreate && beforeCreate()


    const state = reactive(data())
    const [props, attrs] = resolveProps(propsOption, vnode.props)
    const instance = {
        state,
        props: shallowReactive(props),
        isMounted: false,
        subTree: null
    }

    vnode.component = instance

    const renderContext = new Proxy(instance, {
        get(t, k, r) {
            const { state, props } = t
            if (state && k in state) {
                return state[k]
            } else if (k in props) {
                return props[k]
            } else {
                console.log('不存在' + k)
            }
        },
        set(t, k, v, r) {
            const { state, props } = t
            if (state && k in state) {
                state[k] = v
            } else if (k in props) {
                props[k] = v
            } else {
                console.log('不存在' + k)
            }
        }
    })

    created && created.call(renderContext)

    effect(() => {
        const subTree = render.call(renderContext, renderContext)
        if (!instance.isMounted) {
            beforeMount && beforeMount.call(renderContext)
            patch(null, subTree, container, anchor)
            instance.isMounted = true
            mounted && mounted.call(renderContext)
        } else {
            beforeUpdate && beforeUpdate.call(renderContext)
            patch(instance.subTree, subTree, container, anchor)
            updated && updated.call(renderContext)
        }
        instance.subTree = subTree
    }, {
        scheduler: queueJob
    })
}


function patchComponent(n1, n2, anchor) {
    const instance = (n2.component = n1.component)
    const { props } = instance
    if (hasPropsChanged(n1.props, n2.props)) {
        const [nextProps] = resolveProps(n2.type.props, n2.props)
        for (const k in nextProps) {
            props[k] = nextProps[k]
        }

        for (const k in props) {
            if (!(k in nextProps)) {
                delete props[k]
            }
        }
    }
}