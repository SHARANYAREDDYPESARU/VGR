const users = require("../models/userSchema");
const userotp = require("../models/userOtp");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
require("dotenv").config(); // Load env variables

// email config
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

exports.userregister = async (req, res) => {
    const { fname, email, password, phone } = req.body;

    if (!fname || !email || !password || !phone) {
        return res.status(400).json({ error: "Please Enter All Input Data" });
    }

    try {
        const presuer = await users.findOne({ email });

        if (presuer) {
            return res.status(400).json({ error: "This User Already Exists in our DB" });
        }

        const userregister = new users({ fname, email, password, phone });

        const storeData = await userregister.save();
        res.status(200).json(storeData);

    } catch (error) {
        res.status(400).json({ error: "Invalid Details", details: error });
    }
};

// user send otp
exports.userOtpSend = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Please Enter Your Email and Password" });
    }

    const user = await users.findOne({ email });
    if (!user) {
        return res.status(400).json({ error: "User not found" });
    }

    try {
        const OTP = Math.floor(100000 + Math.random() * 900000);

        const existEmail = await userotp.findOne({ email });

        if (existEmail) {
            const updateData = await userotp.findByIdAndUpdate(
                existEmail._id,
                { otp: OTP },
                { new: true }
            );
            await updateData.save();
        } else {
            const saveOtpData = new userotp({ email, otp: OTP });
            await saveOtpData.save();
        }

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "OTP Verification",
            text: `Your OTP is: ${OTP}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Email Error:", error);
                return res.status(400).json({ error: "Email not sent" });
            } else {
                console.log("Email sent:", info.response);
            }
        });

        await client.messages.create({
            body: `Your OTP is: ${OTP}`,
            to: `+91${user.phone}`,
            from: process.env.TWILIO_PHONE_NUMBER,
        });

        res.status(200).json({ message: "OTP sent via Email and SMS" });

    } catch (error) {
        res.status(400).json({ error: "Error sending OTP", details: error });
    }
};

exports.userLogin = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: "Please Enter Your OTP and Email" });
    }

    try {
        const otpverification = await userotp.findOne({ email });

        if (otpverification && otpverification.otp === otp) {
            const preuser = await users.findOne({ email });
            const token = await preuser.generateAuthtoken();
            res.status(200).json({ message: "Login Successful", userToken: token });
        } else {
            res.status(400).json({ error: "Invalid OTP" });
        }
    } catch (error) {
        res.status(400).json({ error: "Login Failed", details: error });
    }
};
