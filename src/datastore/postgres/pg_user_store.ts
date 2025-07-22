import { DataSource } from "typeorm";
import { UserInfo } from "../../model/model";


export class pg_user_store {

    constructor(private db: DataSource) {
    }

    async saveUser(user:UserInfo){
        const userRepository = this.db.getRepository(UserInfo)
        await userRepository.save(user)
    }

    async getUser(id:string){
        const userRepository = this.db.getRepository(UserInfo)
        return await userRepository.findOne({where:{id}})
    }

    async updateUser(user:UserInfo){
        const userRepository = this.db.getRepository(UserInfo)
        await userRepository.update(user.id, user)
    }

    async deleteUser(id:string){
        const userRepository = this.db.getRepository(UserInfo)
        await userRepository.delete(id)
    }
}