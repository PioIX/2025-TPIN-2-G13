 const useConection = () =>{
    const ip = "http://192.168.0.175" 
    const port = "4006"

    const url = ip + ":" + port
      return { url };
}  

export { useConection };