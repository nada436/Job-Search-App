import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import CryptoJS from 'crypto-js'
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    provider: { type: String, enum: ['google', 'system'], required: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    DOB: { type: Date, required: true},
    mobileNumber: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'User' },
    isConfirmed: { type: Boolean, default: false },
    deletedAt: { type: Date },
    bannedAt: { type: Date },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    changeCredentialTime: { type: Date},
    profilePic: { secure_url: String, public_id: String },
    coverPic: { secure_url: String, public_id: String },
    OTP: [{ code: String, type: { type: String, enum: ['confirmEmail', 'forgetPassword'] }, expiresIn: Date }]
}, { timestamps: true });

userSchema.virtual('username').get(function() {
    return `${this.firstName}${this.lastName}`;
});

//  Pre-save hook to hash password and encrypt mobileNumber
userSchema.pre('save', async function (next) {
    if (this?.isModified('password')) {
        this.password = await bcrypt.hash(this.password, +process.env.SECRET_KEY);
    }
    // Encrypt mobileNumber only if modified
    if (this?.isModified('mobileNumber')) {
        this.mobileNumber = await CryptoJS.AES.encrypt(this.mobileNumber, process.env.SECRET_KEY).toString();
    }

    next();
});

//decrypt mobileNumber
    userSchema.post("findOne", function (doc) {
        if(doc?.mobileNumber){
         doc.mobileNumber = CryptoJS.AES.decrypt(doc.mobileNumber, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);}}
        
  );
  





export const user_model = mongoose.model('User', userSchema)||mongoose.model.User;


