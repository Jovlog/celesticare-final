import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    legacy_id: { type: String, unique: true, sparse: true },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: 2,
      maxlength: 30
    },
    name: { type: String, default: null, trim: true },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    isVerified: { type: Boolean, default: true },
    emailVerificationTokenHash: { type: String, default: null, select: false },
    emailVerificationTokenExpiresAt: { type: Date, default: null, select: false },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user'
    },
    is_admin: { type: Boolean, default: false },
    deleted_at: { type: Date, default: null },
    show_reset_notification: { type: Boolean, default: false },
    zodiac_sign: { type: String, default: null },
    undertone: { type: String, default: null },
    birthdate: { type: String, default: null },
    gender: { type: String, default: null },
    season: { type: String, default: null },
    aesthetic_result: { type: String, default: null },
    style_result: { type: String, default: null },
    security_question1: { type: String, default: null },
    security_answer1: { type: String, default: null, select: false },
    security_question2: { type: String, default: null },
    security_answer2: { type: String, default: null, select: false },
    security_question3: { type: String, default: null },
    security_answer3: { type: String, default: null, select: false },
    security_setup_complete: { type: Boolean, default: false }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);