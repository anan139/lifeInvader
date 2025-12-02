export const protect = async (req, res, next) => {
    try {
       const {userId} = await req.auth();
       if(!userId){
        return res.json({success:false, messege: "not authenticated"})
       }
       next() 
    } catch (error) {
        res.json({success:false, messege: error.messege})
    }
}