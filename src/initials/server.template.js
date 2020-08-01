import { app, router, store } from '{{{INIT_SCRIPT}}}';
export default context => {
    return new Promise((resolve, reject) => {
        router.push(context.url)
        router.onReady(() => {
            const matchedComponents = router.getMatchedComponents();
            if (!matchedComponents.length) {
                return reject(new Error({
                    code: 404
                }));
            }
            Promise.all(matchedComponents.map(c => {
                if (c.asyncData) {
                    return c.asyncData({ store, context })
                }
            }))
                .then(() => {
                    store.replaceState(context);
                    resolve(app)
                })
                .catch(reject)
        }, reject)
    })
}