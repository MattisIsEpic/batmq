import * as net from "net"
import { unpack, pack } from 'msgpackr';

unpack(pack({"foo": "bar"}))

class Server{
    constructor(ip_address){
        this.ids = new Set()
        this.id_lookup = {}
        this.serve = net.createServer(conn => {
            conn.on("data", data => {
                const data_json = unpack(data)
                if (Object.keys(data_json).includes("name")){
                    this.ids.add(conn.remoteAddress)
                    this.id_lookup[data_json.name] = conn
                } else {
                    const other = this.id_lookup[data_json.target]
                    other.write(pack({event: data_json.event, data: data_json.data}))
                }
            })
        })
        this.serve.listen(9090, ip_address)
    }
}

class Client{
    constructor(host, local_name){
        this.local_name = local_name
        this.serve = net.createConnection(9090, host, () => {
            this.serve.write(pack({name: local_name}))
        })

        this.serve.on("data", (data) => {
            const data_json = unpack(data)
            const eventID = data_json.event
            const eventData = data_json.data
            console.log(`${this.local_name}: Event fired: ${eventID}{${eventData}:${typeof(eventData)}}`)
        })
    }

    Send(target, event, data){
        this.serve.write(pack({"target": target, "event": event, "data": data}))
    }
}

export {Server, Client}