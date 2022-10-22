import PostModel from "../models/Post.js";

export const getLastTags = async (req, res) => {
    try {
        const posts = await PostModel.find().limit(5).exec();

        const tags = posts.map(post => post.tags).flat().slice(0, 5);

        res.json(tags);
    } catch (err) {
        console.log(err);

        res.status(500).json({
             message: 'Oops...Something went wrong!'
        });
    }
}

export const getAll = async (req, res) => {
    try {
        const posts = await PostModel.find().populate('user', '-passwordHash').exec();

        res.json(posts);
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: 'Oops...Something went wrong!'
        });
    }
}

export const getOne = async (req, res) => {
    try {
        const postId = req.params.id;

        PostModel.findOneAndUpdate(
            {_id: postId},
            {$inc: {viewsCount: 1}},
            {returnDocument: 'after'},
            (err, doc) => {
                if (err) {
                    console.log(err);

                    return res.status(500).json({
                        message: 'Return post failed!'
                    });
                }

                if (!doc) {
                    return res.status(404).json({
                        message: 'Post not found!'
                    });
                }

                res.json(doc);
            }
        ).populate('user', '-passwordHash');
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: 'Oops...Something went wrong!'
        });
    }
}

export const remove = async (req, res) => {
    try {
        const postId = req.params.id;

        PostModel.findOneAndDelete(
            {_id: postId},
            (err, doc) => {
                if (err) {
                    console.log(err);

                    return res.status(500).json({
                        message: 'Delete post failed!'
                    });
                }

                if (!doc) {
                    return res.status(404).json({
                        message: 'Post not found!'
                    });
                }

                return res.json({success: true});
            }
        );
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: 'Oops...Something went wrong!'
        });
    }
}

export const create = async (req, res) => {
    const {title, text, imageUrl, tags} = req.body;

    try {
        const doc = new PostModel({
            title,
            text,
            imageUrl,
            tags: tags.split(', '),
            user: req.userId
        });

        const post = await doc.save();

        res.json(post);
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: 'Oops...Something went wrong!'
        });
    }
}

export const update = async (req, res) => {
    const {title, text, imageUrl, tags} = req.body;

    try {
        const postId = req.params.id;

        await PostModel.updateOne(
            {_id: postId},
            {
                title,
                text,
                imageUrl,
                tags: tags.split(', '),
                user: req.userId
            }
        );

        res.json({
            success: true
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: 'Update post failed!'
        });
    }
}