const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const encrypt = require("../encrypt/encrypt.js");

const authMiddleware = require("../middlewares/auth-middleware.js");

//회원가입

router.post('/signup', async (req, res) => {
	try {
		const { email, name, password, confirmPassword } = req.body;
		
		if (!email || !name || !password || !confirmPassword) {
			return res.status(401).json({ 
                "success": false, 
                "message": "데이터형식이 올바르지 않습니다." 
            });
		}
		
		const emailExp = new RegExp(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i);
		const emailCheck = emailExp.test(email);
		if (!emailCheck) {
			return res.status(402).json({ 
                "success": false, 
                "message": "이메일 형식이 올바르지 않습니다." 
            });
		}
		
		if (password.length < 6) {
			return res.status(403).json({ 
                "success": false, 
                "message": "비밀번호가 너무 짧습니다." 
            });
		}
		
		if (password !== confirmPassword) {
			return res.status(404).json({ 
                "success": false, 
                "message": "비밀번호가 일치하지 않습니다." 
            });
		}

		const existUserName = await Users.findOne({ where: { name } });
		const existUserEmail = await Users.findOne({ where: { email } });
		if ( existUserName || existUserEmail ) {
			return res.status(405).json({ 
                "success": false, 
                "message": "이메일 또는 닉네임이 이미 사용중입니다." 
            });
		}
		//암호화
		const encryptPw = encrypt(password);
		const user = new Users({ email, name, password: encryptPw });
        await user.save();

		return res.status(200).send({
			"success": true,
			"message": "회원가입에 성공하셨습니다."
		});
	} catch {
		return res.status(400).json({ 
            "success": false, 
            "message": "회원가입에 실패하였습니다." 
        });
	}
});

//로그인
router.post('/users', async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(401).json({ 
                "success": false, 
                "message": "데이터형식이 올바르지 않습니다" 
            });
		}
		
        const userinfo = await Users.findOne({ where: { email } });
		if (!userinfo) {
            const encryptPw = encrypt(password);

            if (userinfo.password === encryptPw) {
                let expires = new Date();
                expires.setMinutes(expires.getMinutes() + 60*12);

                const token = jwt.sign(
                    { email, name:userinfo.name},
                    "secret-key",
                );
                res.cookie("Authorization", `Bearer ${token}`, {
                    expires: expires
                });

                return res.status(200).json({
                    "success": true, 
                    "message": "로그인에 성공하였습니다." 
                });
            }
            else {
                return res.status(402).json({
                    "success": false, 
                    "message": "아이디나 비밀번호가 다릅니다." 
                });
            }
        }
        else {
            return res.status(403).json({
                "success": false, 
                "message": "유저 아이디가 없습니다." 
            });
        }
    }
    catch {
        res.status(400).json({
            "success": false, 
            "message": "로그인에 실패하였습니다." 
        });
    }
    });

//수정
router.put('/users', authMiddleware, async (req, res) => {
	try {
		const { email, password, newPassword } = req.body;
		if (!email || !password || !newPassword) {
			return res.status(401).json({
				"success": false,
				"message": "데이터형식이 올바르지 않습니다."
			});
		}

        const userinfo = await User.findOne({ where: { email } });
		if (userinfo.password === password) {
			await User.updateOne(
                { email },
                { $set:{password: newPassword} }
                )
			return res.status(200).json({ 
                "success": true, 
               "message": "회원정보를 수정 하였습니다."
            });
		}
		else {
			return res.status(402).json({ 
                "success": false, 
                "message": "비밀번호가 맞지 않습니다." 
            });
		}
	} 
    catch {
		return res.status(400).json({ 
            "success": false, 
            "message": "회원정보를 수정 할 수 없습니다." 
        });
	}
});

//삭제
router.delete('/users', authMiddleware, async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(401).json({ 
                "success": false, 
                "message": "데이터형식이 올바르지 않습니다." 
            });
		}
		
        const userinfo = await Users.findOne({ email });
		if (userinfo.password === password) {
            await User.deleteOne({email});
			return res.status(200).json({ 
                "success": true, 
                "message": "회원정보를 삭제하였습니다." 
            });
		}
		else {
			return res.status(402).json({ 
                "success": false, 
                "message": "회원 정보가 맞지 않습니다." 
            });
		}
	} 
    catch {
		return res.status(400).json({ 
            "success": false, 
            "message": "회원 정보를 삭제 할 수 없습니다." 
        });
	}
});

//로그아웃
router.post("/users/out", authMiddleware, async (req, res) => {
    try {
        res.clearCookie("Authorization");
        res.status(200).json({
            "success": true, 
            "message": "로그아웃에 성공하였습니다."
        });
    }
    catch{
        return res.status(400).json({
            "success": false, 
            "message": "로그아웃에 실패하였습니다."
        });
    }
});

//내보내기  
module.exports = router;