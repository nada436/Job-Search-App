import mongoose from "mongoose";
export const database_connection =() => {
    mongoose.connect(process.env.url).then(() => {
        console.log('conecting to database')
    }).catch((error) => {
        console.log('Failed to connect to the database:', error.message)
    })
}