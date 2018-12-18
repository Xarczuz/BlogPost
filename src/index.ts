(function() {
  interface NewBlogPost {
    title: string;
    body: string;
    author: string;
    dateCreated: number;
    dateModified: number;
  }
  interface BlogPost extends NewBlogPost {
    id: number;
  }
  class blogPost implements BlogPost {
    id: number;
    title: string;
    body: string;
    author: string;
    dateCreated: number;
    dateModified: number;
    constructor(id: number, title: string, body: string, author: string, dateCreated: number, dateModified: number) {
      this.id = id;
      this.title = title;
      this.body = body;
      this.author = author;
      this.dateCreated = dateCreated;
      this.dateModified = dateModified;
    }
  }
  class newBlogPost implements NewBlogPost {
    title: string;
    body: string;
    author: string;
    dateCreated: number;
    dateModified: number;
    constructor(title: string, body: string, author: string, dateCreated: number, dateModified: number) {
      this.title = title;
      this.body = body;
      this.author = author;
      this.dateCreated = dateCreated;
      this.dateModified = dateModified;
    }
  }

  document.addEventListener('DOMContentLoaded', function init() {
    getPosts(function(error: string, response: string) {
      if (error === '') {
        addPostToPage(response);
      } else {
        console.log(error);
      }
    });
  });
  // *********************************************************
  document.addEventListener('mouseover', function(event) {
    const element: any = event.target;
    if (element.className === 'post__arrowDown') {
      let dropDown: HTMLElement = element.nextSibling;
      if (dropDown.classList.contains('hide')) {
        dropDown.classList.remove('hide');
        let post: HTMLElement = element.closest('.post');
        post.addEventListener('mouseleave', function closeDropDown(event: any) {
          if (event.target.className === 'post') {
            let dropIsDown: HTMLElement = event.target.querySelector('.post__dropDown');
            dropIsDown.classList.add('hide');
            post.removeEventListener('mouseleave', closeDropDown);
          }
        });
      } else {
        dropDown.classList.add('hide');
      }
    }
  });
  document.addEventListener('click', function(event) {
    const element: any = event.target;
    if (element.className === 'post__dropDownContent') {
      let post: HTMLElement = element.closest('.post');
      if (element.innerText == 'Delete') {
        deletePost(parseInt(post.id), post, function(error: string, post: HTMLElement) {
          if (error === '') {
            post.parentNode.removeChild(post);
          } else {
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
    let form: HTMLElement = document.getElementById('form__background');
    if (element.id === 'form__closeButton') {
      closeForm(form);
      return;
    }

    if (element.id === 'form__submit') {
      if (form.getAttribute('type') === 'edit') {
        saveEditPostForm(form, function() {
          closeForm(form);
        });
        return;
      } else if (form.getAttribute('type') === 'newPost') {
        let formTitle: HTMLInputElement = form.querySelector('#form__title');
        let formAuthor: HTMLInputElement = form.querySelector('#form__author');
        let formBody: HTMLInputElement = form.querySelector('#form__body');
        if (formTitle.value === '') {
          formTitle.focus();
          alert('Write a title');
          return;
        } else if (formAuthor.value === '') {
          formAuthor.focus();
          alert('Write a name');
          return;
        } else if (formBody.value === '') {
          formBody.focus();
          alert('Write a text');
          return;
        }
        addPost(form, function(error: string, form: HTMLElement, response: string) {
          if (error === '') {
            closeForm(form);
            addPostToPage(response);
            return;
          } else {
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
  function closeForm(form: HTMLElement) {
    form.classList.add('hide');
    form.setAttribute('postId', '');
    form.setAttribute('type', '');
    let formTitle: HTMLInputElement = form.querySelector('#form__title');
    let formAuthor: HTMLInputElement = form.querySelector('#form__author');
    let formBody: HTMLInputElement = form.querySelector('#form__body');
    formTitle.value = '';
    formAuthor.value = '';
    formBody.value = '';
  }
  function saveEditPostForm(form: HTMLElement, callback: Function) {
    let postId: number = parseInt(form.getAttribute('postId'));
    let post: HTMLElement = document.getElementById(postId.toString());
    let postTitle: HTMLElement = post.querySelector('.post__title');
    let postAuthor: HTMLElement = post.querySelector('.post__author');
    let postBody: HTMLElement = post.querySelector('.post__body');
    let postDateCreated: HTMLElement = post.querySelector('.post__dateCreated');
    let dateCreated = new Date(parseInt(postDateCreated.getAttribute('created')));
    let postDateModified: HTMLElement = post.querySelector('.post__dateModified');

    let formTitle: HTMLInputElement = form.querySelector('#form__title');
    let formAuthor: HTMLInputElement = form.querySelector('#form__author');
    let formBody: HTMLInputElement = form.querySelector('#form__body');

    let date: Date = new Date();

    let postObj: BlogPost = new blogPost(postId, formTitle.value, formBody.value, formAuthor.value, dateCreated.getTime(), date.getTime());
    editPost(postId, postObj, function(error: string) {
      if (error === '') {
        postTitle.innerText = formTitle.value;
        postAuthor.innerText = formAuthor.value;
        postBody.innerText = formBody.value;
        postDateModified.innerText = 'Date modified: ' + timeToDate(date.getTime());
        callback();
      } else {
        console.log(error);
      }
    });
  }
  function editPostForm(post: HTMLElement) {
    let postId: string = post.id;
    let postTitle: HTMLElement = post.querySelector('.post__title');
    let postAuthor: HTMLElement = post.querySelector('.post__author');
    let postBody: HTMLElement = post.querySelector('.post__body');
    let form: HTMLElement = document.querySelector('#form__background');
    form.classList.remove('hide');

    let formTitle: HTMLInputElement = form.querySelector('#form__title');
    let formAuthor: HTMLInputElement = form.querySelector('#form__author');
    let formBody: HTMLInputElement = form.querySelector('#form__body');

    form.setAttribute('postId', postId);
    form.setAttribute('type', 'edit');
    formTitle.value = postTitle.innerText;
    formAuthor.value = postAuthor.innerText;
    formBody.value = postBody.innerText;
  }
  // *********************************************************
  function editPost(id: number, postObj: BlogPost, callback: Function) {
    let xhr: XMLHttpRequest = new XMLHttpRequest();
    xhr.open('PATCH', '/posts/' + id);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify(postObj));

    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;
      if (xhr.status === 200) {
        return callback('');
      } else {
        return callback('Error ' + xhr.status);
      }
    };
  }
  function addPost(form: HTMLElement, callback: Function) {
    let formTitle: HTMLInputElement = form.querySelector('#form__title');
    let formAuthor: HTMLInputElement = form.querySelector('#form__author');
    let formBody: HTMLInputElement = form.querySelector('#form__body');
    let date: Date = new Date();
    let newPost: NewBlogPost = new newBlogPost(formTitle.value, formBody.value, formAuthor.value, date.getTime(), null);
    let xhr: XMLHttpRequest = new XMLHttpRequest();
    xhr.open('POST', '/posts');
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify(newPost));

    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;
      if (xhr.status === 201) {
        return callback('', form, xhr.responseText);
      } else {
        return callback('Error ' + xhr.statusText);
      }
    };
  }

  function getPosts(callback: Function) {
    let xhr: XMLHttpRequest = new XMLHttpRequest();
    xhr.open('GET', '/posts');
    xhr.send();

    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;
      if (xhr.status === 200) {
        callback('', xhr.responseText);
      } else {
        callback('Error ' + xhr.status);
      }
    };
  }

  function deletePost(id: number, post: HTMLElement, callback: Function) {
    let xhr: XMLHttpRequest = new XMLHttpRequest();
    xhr.open('DELETE', '/posts/' + id);
    xhr.send();

    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;
      if (xhr.status === 200) {
        return callback('', post);
      } else {
        return callback('Error ' + xhr.statusText);
      }
    };
  }
  // *********************************************************
  function addPostToPage(postData: string) {
    let blogPostObjects: any = JSON.parse(postData);
    let htmlElements: Array<HTMLElement> = [];
    if (blogPostObjects.length > 0) {
      sortByDateCreated(blogPostObjects);
      for (let i = 0; i < blogPostObjects.length; i++) {
        htmlElements.push(createPost(blogPostObjects[i]));
      }
      writePostsToPage(htmlElements, false);
    } else {
      htmlElements.push(createPost(blogPostObjects));
      writePostsToPage(htmlElements, true);
    }
  }

  function writePostsToPage(htmlArry: Array<HTMLElement>, newPost: boolean) {
    let posts: HTMLElement = document.getElementById('posts');
    if (newPost) {
      posts.insertBefore(htmlArry.shift(), posts.firstChild);
    } else {
      htmlArry.forEach((element) => {
        posts.append(element);
      });
    }
  }

  function createPost(blogPost: BlogPost): HTMLElement {
    let post: HTMLDivElement = document.createElement('div');
    post.className = 'post';
    post.id = blogPost.id.toString();

    let title: HTMLHeadingElement = document.createElement('h1');
    title.innerText = blogPost.title;
    title.className = 'post__title';

    let author: HTMLHeadingElement = document.createElement('h2');
    author.innerText = blogPost.author;
    author.className = 'post__author';

    let dropDownContainer: HTMLDivElement = document.createElement('div');
    dropDownContainer.classList.add('post__dropDownContainer');

    let text: HTMLParagraphElement = document.createElement('p');
    text.className = 'post__body';
    text.innerText = blogPost.body;

    let arrow: HTMLElement = document.createElement('i');
    arrow.className = 'post__arrowDown';

    let dropDownContent: HTMLUListElement = document.createElement('ul');
    dropDownContent.classList.add('post__dropDown', 'hide');

    let edit: HTMLLIElement = document.createElement('li');
    edit.innerText = 'Edit';
    edit.className = 'post__dropDownContent';

    let del: HTMLLIElement = document.createElement('li');
    del.innerText = 'Delete';
    del.className = 'post__dropDownContent';

    let dateCreated: HTMLParagraphElement = document.createElement('p');
    dateCreated.innerText = 'Date created: ' + timeToDate(blogPost.dateCreated);
    dateCreated.setAttribute('created', '' + blogPost.dateCreated);
    dateCreated.classList.add('post__date', 'post__dateCreated');

    let dateModified: HTMLParagraphElement = document.createElement('p');
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
  function timeToDate(timeInMilliseconds: number): string {
    let date: Date = new Date(timeInMilliseconds);
    return date.toDateString() + ' kl:' + date.toLocaleTimeString().slice(0, 5);
  }

  function sortByDateCreated(blogPosts: Array<BlogPost>) {
    blogPosts.sort(function(a: BlogPost, b: BlogPost) {
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
