const a = async () => {
    const actions = () => {
        return new Map([
            [/^eft/, async ()=> {
                return await new Promise((r,r2) => {
                    setTimeout(() => {
                        console.log("start with eft");
                        r('1')
                    }, 500);
                })
            }],
            [/^stripe$/, async () => {
                console.log("start with stripe");
            }],
            [/^mpgs$/, async () => {
                console.log("start with mpgs");
            }],
        ])
    };
    
    
    let action = [...actions()].find(([key, value]) => key.test("eft"))
    let a = action && action[1] && await action[1]();
    console.log("result:",a);
}
a();