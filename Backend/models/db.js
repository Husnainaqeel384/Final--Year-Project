
import knex from 'knex';
const db = knex({
    client:'mysql',
    connection:{
        // host:process.env.HOST,
        // user:process.env.DATABASE_USER_NAME,
        // password:"",
        // database:process.env.DATASBASE_NAME
        host:"localhost",
        user:"root",
        password:"",
        database:"budget_management_system"
    },
    pool: { min: 0, max: 7 }
})

export default db;