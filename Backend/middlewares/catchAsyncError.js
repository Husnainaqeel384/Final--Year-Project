
// we make try catch block so we wrap the function inside the catch AsyncError

export const catchAsyncError=(asyncfunction)=>{
    return (req,res,next)=>{
        Promise.resolve(asyncfunction(req,res,next)).catch(next);
    }
}