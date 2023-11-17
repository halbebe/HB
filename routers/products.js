const express = require("express");
const { Products, Users, Sequelize } = require("../models");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware.js");

//상품등록
router.post("/products", authMiddleware, async (req, res) =>{
    try {
        const { title, content } = req.body;
        if (!title || !content ) {
            return res. status(401).json({
                "success": false,
                "message": "데이터형식이 올바르지 않습니다."
            });
        }
        const product = new Products({
            userId: res.locals.user.dataValues.id,
            title,
            status: "FOR_SALE",
            content: content,
            createdAt: new Date(),
            updateAt: new Date()
        })
        await product.save();
        return res.status(200).json({
            "success": true,
            "message": "상품을 등록하였습니다."
        });
    }
    catch {
        return res.status(400).json({
            "success": false,
            "message": "상품 등록에 실패하였습니다."
        });
    }
})

//상품 목록 조회
router.get('/products', async (req, res) => {
	try {
		const sort = req.query.sort === "DESC" ? "DESC" : "DESC";
		const products = await Products.findAll({
			attributes: ["id", "title", "content", "status", "createdAt", "userId"],
			include: [
				{
					model: Users,
					attributes: ["name"],
                    where: {
                        id: Sequelize.col("{Products.userId"),
                    },
				},
			],
			order: [['createdAt', sort]],
		});

		return res.status(200).json({ 
            success: true, 
            "data": products 
        });
	} 
    catch {
		return res.status(500).json({ 
            "success": false, 
            "message": "삼품목록을 조회할 수 없습니다." 
        });
	}
});

//상품 상세 조회
router.get("/products/:Id", async (req, res) => {
	try {
		const id = req.params.id;
		const products = await Products.findOne({
			where: { id },
			attributes: ["id","title","content","status","createdAt","userId"],
			include: [
				{
					model: Users,
					attributes: ["name"],
                    where: {
                        id: Sequelize.col("Products.userId"),
                    },
				},
			]
		});

		if (!products.dataValues) {
            return res.status(401).json({
                success: false,
                message:"상품조회에 실패 하였습니다."
            });
        }
        return res.status(200).json({
            success: true,
            data: products
        });
    }
    catch (err) {
        return res.status(400).json({
            success:false,
            message: "상품조회에 실패 하였습니다."
        });
    }
});

//상품 수정
router.get("/products/:Id", async (req, res) =>{
    try {
        const id = req.params.id;
        const { title, content } = req.body;

        if (!title || !content ) {
            return res.status(401).json({
                success: false,
                message: "데이터 형식이 올바르지 않습니다."
            });
        }
        const products = await Products.findOne({ id });

        if (!products.dataValues) {
            return res.status(402).json({
                success: false,
                message: "상품을 수정할 권한이 존재하지 않습니다."
            });
        }

        const updateAt = new Date();

        Products.update(
            {
                title, content, updateAt
            },
            {
                where : { id }
            }).then(()=>{
                return res.status(200).json({
                    success: true,
                    message: "상품 정보를 수정하였습니다."
                });
            });
    }
    catch (err) {
        return res.status(400).json({
            success: false,
            message: "상품 정보 수정에 실패하였습니다."
        });
    }
    })

    //상품 삭제
    router.delete("/products", authMiddleware, async (req, res) =>{
        try {
            const id = req.params.id;
            const products = await Products.findOne({ id });

            if (!products.dataValues) {
                return res.status(401).json({
                    success: false,
                    message: "상품조회에 실패 하였습니다."
                });
            }
            if (products.dataValues.userId !== res.locals.user.dataValues.id) {
                return res.status(402).json({
                    success: false,
                    message: "상품을 삭제할 권한이 존재하지 않습니다."
                });
            }
            Products.destroy(
                {
                    where : {id}
                }).then(()=>{
                    return res.status(200).json({
                        success: false,
                        message: "상품정보를 삭제하였습니다."
                    });
                })
        }
        catch {
            return res.status(400).json({
                success:false,
                message: "상품 삭제에 실패 하였습니다."
            });
        }
    });



module.exports = router;