const router = require('express').Router();
const { User, Image, Reference } = require('../../models');
const sequelize = require('../../config/connection');
const cloudinary = require('cloudinary').v2;
const withAuth = require('../../utils/auth');

require("dotenv").config();
require("../../config/cloudinary");

/*working and associated properly with reference model*/
router.get('/', (req, res) => {
    console.log('=====================');
    Image.findAll({
        attributes: [
            'id', 
            'title', 
            'image_url', 
            //[sequelize.literal('(SELECT COUNT(*) FROM like WHERE image.id = like.image_id)'), 'like_count']
        ],
        include: [
            {
                model: User,
                attributes: ['username']
            },
            {
                model: Reference,
                attributes: ['title']
            }
        ]
    })
        .then(dbImageData => res.json(dbImageData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

/* working */
router.get('/:id', (req, res) => {
    Image.findOne({
        where: {
            id: req.params.id
        },
        attributes: [
            'id',
            'title',
            'image_url',
            //[sequelize.literal('(SELECT COUNT(*) FROM like WHERE image.id = image_id)'), 'like_count']
        ],
        include: [
            {
                model: User,
                attributes: ['username']
            },
            {
                model: Reference,
                attributes: ['title']
            }
        ]
    })
        .then(dbImageData => {
            if (!dbImageData) {
                res.status(404).json({ message: 'No image found with this id' });
                return;
            }
            res.json(dbImageData)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        })
})

/*working*/
router.post('/upload', withAuth, (req, res) => {
    cloudinary.uploader.upload(req.body.data, (error, result) => {
        console.log(result, error)
        if (result) {
            Image.create({
                title: req.body.title,
                image_url: result.url,
                user_id: req.session.user_id,
                reference_id: req.body.reference.id
            })
                .then(image => {
                    console.log('file uploaded');
                    console.dir(image)
                })
                .catch(err => {
                    console.log(err);
                    res.json(500).json(err);
                })
            return
        }
    })
    return res.json(500);
});

/* working */
router.delete('/:id', (req, res) => {
    Image.destroy({
        where: {
            id: req.params.id
        }
    })
        .then(dbImageData => {
            if (!dbImageData) {
                res.status(404).json({ message: 'No image found with this id' });
                return
            }
            res.json(dbImageData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});


module.exports = router;