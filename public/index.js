"use strict";
(function () {
    var blogPost = /** @class */ (function () {
        function blogPost(id, title, body, author, dateCreated, dateModified) {
            this.id = id;
            this.title = title;
            this.body = body;
            this.author = author;
            this.dateCreated = dateCreated;
            this.dateModified = dateModified;
        }
        return blogPost;
    }());
    var newBlogPost = /** @class */ (function () {
        function newBlogPost(title, body, author, dateCreated, dateModified) {
            this.title = title;
            this.body = body;
            this.author = author;
            this.dateCreated = dateCreated;
            this.dateModified = dateModified;
        }
        return newBlogPost;
    }());
    document.addEventListener('DOMContentLoaded', function init() {
        getPosts(function (error, response) {
            if (error === '') {
                addPostToPage(response);
            }
            else {
                console.log(error);
            }
        });
    });
    // *********************************************************
    document.addEventListener('mouseover', function (event) {
        var element = event.target;
        if (element.className === 'post__arrowDown') {
            var dropDown = element.nextSibling;
            if (dropDown.classList.contains('hide')) {
                dropDown.classList.remove('hide');
                var post_1 = element.closest('.post');
                post_1.addEventListener('mouseleave', function closeDropDown(event) {
                    if (event.target.className === 'post') {
                        var dropIsDown = event.target.querySelector('.post__dropDown');
                        dropIsDown.classList.add('hide');
                        post_1.removeEventListener('mouseleave', closeDropDown);
                    }
                });
            }
            else {
                dropDown.classList.add('hide');
            }
        }
    });
    document.addEventListener('click', function (event) {
        var element = event.target;
        if (element.className === 'post__dropDownContent') {
            var post = element.closest('.post');
            if (element.innerText == 'Delete') {
                deletePost(parseInt(post.id), post, function (error, post) {
                    if (error === '') {
                        post.parentNode.removeChild(post);
                    }
                    else {
                        console.log(error);
                    }
                });
                return;
            }
            if (element.innerText == 'Edit') {
                editPostForm(post);
                return;
            }
        }
        // *********************************************************
        var form = document.getElementById('form__background');
        if (element.id === 'form__closeButton') {
            closeForm(form);
            return;
        }
        if (element.id === 'form__submit') {
            if (form.getAttribute('type') === 'edit') {
                saveEditPostForm(form, function () {
                    closeForm(form);
                });
                return;
            }
            else if (form.getAttribute('type') === 'newPost') {
                var formTitle = form.querySelector('#form__title');
                var formAuthor = form.querySelector('#form__author');
                var formBody = form.querySelector('#form__body');
                if (formTitle.value === '') {
                    formTitle.focus();
                    alert('Write a title');
                    return;
                }
                else if (formAuthor.value === '') {
                    formAuthor.focus();
                    alert('Write a name');
                    return;
                }
                else if (formBody.value === '') {
                    formBody.focus();
                    alert('Write a text');
                    return;
                }
                addPost(form, function (error, form, response) {
                    if (error === '') {
                        closeForm(form);
                        addPostToPage(response);
                        return;
                    }
                    else {
                        console.log(error);
                        return;
                    }
                });
            }
        }
        // *********************************************************
        if (element.id === 'newPost') {
            form.setAttribute('type', 'newPost');
            form.classList.remove('hide');
            return;
        }
    });
    // *********************************************************
    function closeForm(form) {
        form.classList.add('hide');
        form.setAttribute('postId', '');
        form.setAttribute('type', '');
        var formTitle = form.querySelector('#form__title');
        var formAuthor = form.querySelector('#form__author');
        var formBody = form.querySelector('#form__body');
        formTitle.value = '';
        formAuthor.value = '';
        formBody.value = '';
    }
    function saveEditPostForm(form, callback) {
        var postId = parseInt(form.getAttribute('postId'));
        var post = document.getElementById(postId.toString());
        var postTitle = post.querySelector('.post__title');
        var postAuthor = post.querySelector('.post__author');
        var postBody = post.querySelector('.post__body');
        var postDateCreated = post.querySelector('.post__dateCreated');
        var dateCreated = new Date(parseInt(postDateCreated.getAttribute('created')));
        var postDateModified = post.querySelector('.post__dateModified');
        var formTitle = form.querySelector('#form__title');
        var formAuthor = form.querySelector('#form__author');
        var formBody = form.querySelector('#form__body');
        var date = new Date();
        var postObj = new blogPost(postId, formTitle.value, formBody.value, formAuthor.value, dateCreated.getTime(), date.getTime());
        editPost(postId, postObj, function (error) {
            if (error === '') {
                postTitle.innerText = formTitle.value;
                postAuthor.innerText = formAuthor.value;
                postBody.innerText = formBody.value;
                postDateModified.innerText = 'Date modified: ' + timeToDate(date.getTime());
                callback();
            }
            else {
                console.log(error);
            }
        });
    }
    function editPostForm(post) {
        var postId = post.id;
        var postTitle = post.querySelector('.post__title');
        var postAuthor = post.querySelector('.post__author');
        var postBody = post.querySelector('.post__body');
        var form = document.querySelector('#form__background');
        form.classList.remove('hide');
        var formTitle = form.querySelector('#form__title');
        var formAuthor = form.querySelector('#form__author');
        var formBody = form.querySelector('#form__body');
        form.setAttribute('postId', postId);
        form.setAttribute('type', 'edit');
        formTitle.value = postTitle.innerText;
        formAuthor.value = postAuthor.innerText;
        formBody.value = postBody.innerText;
    }
    // *********************************************************
    function editPost(id, postObj, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('PATCH', '/posts/' + id);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send(JSON.stringify(postObj));
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4)
                return;
            if (xhr.status === 200) {
                return callback('');
            }
            else {
                return callback('Error ' + xhr.status);
            }
        };
    }
    function addPost(form, callback) {
        var formTitle = form.querySelector('#form__title');
        var formAuthor = form.querySelector('#form__author');
        var formBody = form.querySelector('#form__body');
        var date = new Date();
        var newPost = new newBlogPost(formTitle.value, formBody.value, formAuthor.value, date.getTime(), null);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/posts');
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send(JSON.stringify(newPost));
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4)
                return;
            if (xhr.status === 201) {
                return callback('', form, xhr.responseText);
            }
            else {
                return callback('Error ' + xhr.statusText);
            }
        };
    }
    function getPosts(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/posts');
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4)
                return;
            if (xhr.status === 200) {
                callback('', xhr.responseText);
            }
            else {
                callback('Error ' + xhr.status);
            }
        };
    }
    function deletePost(id, post, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('DELETE', '/posts/' + id);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4)
                return;
            if (xhr.status === 200) {
                return callback('', post);
            }
            else {
                return callback('Error ' + xhr.statusText);
            }
        };
    }
    // *********************************************************
    function addPostToPage(postData) {
        var blogPostObjects = JSON.parse(postData);
        var htmlElements = [];
        if (blogPostObjects.length > 0) {
            sortByDateCreated(blogPostObjects);
            for (var i = 0; i < blogPostObjects.length; i++) {
                htmlElements.push(createPost(blogPostObjects[i]));
            }
            writePostsToPage(htmlElements, false);
        }
        else {
            htmlElements.push(createPost(blogPostObjects));
            writePostsToPage(htmlElements, true);
        }
    }
    function writePostsToPage(htmlArry, newPost) {
        var posts = document.getElementById('posts');
        if (newPost) {
            posts.insertBefore(htmlArry.shift(), posts.firstChild);
        }
        else {
            htmlArry.forEach(function (element) {
                posts.append(element);
            });
        }
    }
    function createPost(blogPost) {
        var post = document.createElement('div');
        post.className = 'post';
        post.id = blogPost.id.toString();
        var title = document.createElement('h1');
        title.innerText = blogPost.title;
        title.className = 'post__title';
        var author = document.createElement('h2');
        author.innerText = blogPost.author;
        author.className = 'post__author';
        var dropDownContainer = document.createElement('div');
        dropDownContainer.classList.add('post__dropDownContainer');
        var text = document.createElement('p');
        text.className = 'post__body';
        text.innerText = blogPost.body;
        var arrow = document.createElement('i');
        arrow.className = 'post__arrowDown';
        var dropDownContent = document.createElement('ul');
        dropDownContent.classList.add('post__dropDown', 'hide');
        var edit = document.createElement('li');
        edit.innerText = 'Edit';
        edit.className = 'post__dropDownContent';
        var del = document.createElement('li');
        del.innerText = 'Delete';
        del.className = 'post__dropDownContent';
        var dateCreated = document.createElement('p');
        dateCreated.innerText = 'Date created: ' + timeToDate(blogPost.dateCreated);
        dateCreated.setAttribute('created', '' + blogPost.dateCreated);
        dateCreated.classList.add('post__date', 'post__dateCreated');
        var dateModified = document.createElement('p');
        if (blogPost.dateModified !== null) {
            dateModified.innerText = 'Date modified: ' + timeToDate(blogPost.dateModified);
        }
        dateModified.classList.add('post__date', 'post__dateModified');
        dropDownContent.append(edit);
        dropDownContent.append(del);
        dropDownContainer.append(arrow);
        dropDownContainer.append(dropDownContent);
        post.append(dropDownContainer);
        post.append(title);
        post.append(author);
        post.append(text);
        post.append(dateCreated);
        post.append(dateModified);
        return post;
    }
    // *********************************************************
    function timeToDate(timeInMilliseconds) {
        var date = new Date(timeInMilliseconds);
        return date.toDateString() + ' kl:' + date.toLocaleTimeString().slice(0, 5);
    }
    function sortByDateCreated(blogPosts) {
        blogPosts.sort(function (a, b) {
            if (a.dateCreated > b.dateCreated) {
                return -1;
            }
            if (a.dateCreated < b.dateCreated) {
                return 1;
            }
            return 0;
        });
    }
})();
