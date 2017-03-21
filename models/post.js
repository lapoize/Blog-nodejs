var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Post(name, title, post) {
    this.name = name;
    this.title = title;
    this.post = post;
}

module.exports = Post;

Post.prototype.save = function (callback) {
    var date = new Date();
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + "-" + (date.getMonth() + 1),
        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }
    var post = {
        name: this.name,
        time: time,
        title: this.title,
        post: this.post
    };
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.insert(post, {
                safe: true
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

Post.get = function (name, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            collection.find(query).sort({ time: -1 }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};

Post.getByID = function (id, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        console.log("begin find");
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            console.log("start find");
            console.log(collection);
            console.log(collection.findOne({ _id: new ObjectID(id) }));
            collection.findOne({ _id: new ObjectID(id) }, function (err, doc) {
                console.log(doc);
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, doc);
            });
        })
    })
}

Post.updata = function (post, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            console.log(post.id);
            console.log(post.postdata);
            collection.findOne({ _id: new ObjectID(post.id) }, function (err, doc) {
                if (err) {
                    return callback(err);
                }
                console.log(doc.time);
                post.postdata.time = doc.time;
                console.log(post.time);
                collection.update({ _id: new ObjectID(post.id) }, post.postdata, function (err) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                });
                mongodb.close();
            });
        });
    });
};

Post.del = function (id, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.remove({ _id: new ObjectID(id) });
            mongodb.close();
        });
    });
};

Post.doComment = function (comment, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('comments', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var date = new Date();
            var time = {
                date: date,
                year: date.getFullYear(),
                month: date.getFullYear() + "-" + (date.getMonth() + 1),
                day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
                minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
                date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
            }
            comment.time = time;
            collection.insert(comment, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, null);
            });
        });
    });
};

Post.getComment = function (id, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('comments', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.find({ articleID: id }).sort({ time: -1 }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};