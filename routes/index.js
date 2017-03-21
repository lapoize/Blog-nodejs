var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js');

module.exports = function (app) {
    app.get('/', function (req, res) {
        Post.get(null, function (err, posts) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: '主页',
                user: req.session.user,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    app.get('/reg', checkNotLogin);
    app.get('/reg', function (req, res) {
        res.render('reg', {
            title: '注册',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/reg', checkNotLogin);
    app.post('/reg', function (req, res) {
        var name = req.body.name,
            password = req.body.password,
            password_re = req.body['password-repeat'];
        if (password_re != password) {
            req.flash('error', '两次输入的密码不一致!');
            return res.redirect('/reg');
        }
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        var newUser = new User({
            name: name,
            password: password,
            email: req.body.email
        });
        User.get(newUser.name, function (err, user) {
            if (user) {
                req.flash('error', '用户已存在!');
                return res.redirect('/reg');
            }
            newUser.save(function (err, user) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/reg');
                }
                req.session.user = user;
                req.flash('success', '注册成功!');
                res.redirect('/');
            });
        });
    });

    app.get('/login', checkNotLogin);
    app.get('/login', function (req, res) {
        res.render('login', {
            title: '登录',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/login', checkNotLogin);
    app.post('/login', function (req, res) {
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        User.get(req.body.name, function (err, user) {
            if (!user) {
                req.flash('error', '用户不存在!');
                return res.redirect('/login');
            }
            if (user.password != password) {
                req.flash('error', '密码错误!');
                return res.redirect('/login');
            }
            req.session.user = user;
            req.flash('success', '登陆成功!');
            res.redirect('/');
        });
    });

    app.get('/post', checkLogin);
    app.get('/post', function (req, res) {
        res.render('post', {
            title: '发表',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/post', checkLogin);
    app.post('/post', function (req, res) {
        var str = req.body.post;
        var reg = new RegExp("\r\n", "g");
        str = str.replace(reg, "<br>");
        var currentUser = req.session.user,
            post = new Post(currentUser.name, req.body.title, str);
        post.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', '发布成功!');
            res.redirect('/');
        });
    });

    app.get('/logout', checkLogin);
    app.get('/logout', function (req, res) {
        req.session.user = null;
        req.flash('success', '登出成功!');
        res.redirect('/');
    });

    app.post('/', checkLogin);
    app.post('/', function (req, res) {
        console.log("get view //");
        if (req.body.action.toString() == "view") {
            console.log("view");
            var postID = req.body.id;
            Post.getByID(postID, function (err, post) {
                if (err) {
                    res.redirect('/');
                }
                console.log(postID);
                Post.getComment(postID, function (err, comments) {
                    if (err) {
                        comments = [];
                    }
                    console.log(comments);
                    res.render('view', {
                        title: post.title,
                        user: req.session.user,
                        article: post,
                        comment: comments,
                        success: req.flash('success').toString(),
                        error: req.flash('error').toString()
                    });
                });
            });
        } else if (req.body.action.toString() == "delete") {
            console.log("POSTED");
            if (req.session.user.name !== req.body.writer) {
                return res.redirect('/');
            }
            var postID = req.body.id;
            Post.del(postID);
            res.redirect('/');
        } else if (req.body.action.toString() == "edit") {
            console.log("EDIT");
            if (req.session.user.name !== req.body.writer) {
                return res.redirect('/');
            }
            var postID = req.body.id;
            Post.getByID(postID, function (err, post) {
                if (err) {
                    res.redirect('/');
                }
                res.render('edit', {
                    title: post.title,
                    user: req.session.user,
                    article: post,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
        } else if (req.body.action.toString() == "doedit") {
            post = new Post(req.body.writer, req.body.title, req.body.post);
            console.log(post);
            post = { id: req.body.id, postdata: post };
            console.log(post);
            Post.updata(post, function (err) {
                req.flash('error', err);
                return res.redirect('/');
            });
            return res.redirect('/');
        } else if (req.body.action.toString() == "comment") {
            comment = new Post(req.session.user.name, null, req.body.context);
            comment.articleID = req.body.id;
            var postID = req.body.id;
            console.log("DO COMMENT");
            Post.doComment(comment, function (err) {
                if (err) {
                    res.redirect('/');
                }
                console.log("COMMENT SUCC");
                Post.getByID(postID, function (err, post) {
                    if (err) {
                        res.redirect('/');
                    }
                    console.log(post);
                    console.log(postID);
                    Post.getComment(postID, function (err, comments) {
                        if (err) {
                            comments = [];
                        }
                        console.log(comments);
                        res.render('view', {
                            title: post.title,
                            user: req.session.user,
                            article: post,
                            comment: comments,
                            success: req.flash('success').toString(),
                            error: req.flash('error').toString()
                        });
                    });
                });
            });
        }
    });

    function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', '未登录!');
            res.redirect('/login');
        }
        next();
    }

    function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash('error', '已登录!');
            res.redirect('back');
        }
        next();
    }
};  
