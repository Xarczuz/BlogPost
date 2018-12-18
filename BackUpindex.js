(function() {
  document.addEventListener('DOMContentLoaded', function init() {
    getPosts();
  });
  // *********************************************************
  document.addEventListener('mouseover', function(event) {
    if (event.target.className === 'post__arrowDown') {
      if (event.target.nextSibling.classList.contains('hide')) {
        event.target.nextSibling.classList.remove('hide');

        let post = event.target.closest('.post');
        post.addEventListener('mouseleave', function closeDropDown(event) {
          if (event.target.className === 'post') {
            let dropIsDown = event.target.getElementsByClassName('post__dropDown');
            if (dropIsDown.length !== 0) {
              dropIsDown[0].classList.add('hide');
              post.removeEventListener('mouseleave', closeDropDown);
            }
          }
        });
      } else {
        event.target.nextSibling.classList.add('hide');
      }
    }
  });
  document.addEventListener('click', function(event) {
    if (event.target.className === 'post__dropDownContent') {
      let post = event.target.closest('.post');
      if (event.target.innerText == 'Delete') {
        deletePost(post.id, post);
      }
      if (event.target.innerText == 'Edit') {
        editPostForm(post);
      }
    }
    // *********************************************************
    let form = document.getElementById('form__background');
    if (event.target.id === 'form__closeButton') {
      closeForm(form);
    }

    if (event.target.id === 'form__submit') {
      if (form.getAttribute('type') === 'edit') {
        saveEditPostForm(form);
        closeForm(form);
      } else if (form.getAttribute('type') === 'newPost') {
        let formTitle = form.querySelector('#form__title');
        let formBody = form.querySelector('#form__body');
        if (formTitle.value === '') {
          formTitle.focus();
          alert('Write a title');
          return;
        } else if (formBody.value === '') {
          formBody.focus();
          alert('Write a text');
          return;
        }
        addPost(form);
      }
    }
    // *********************************************************
    if (event.target.id === 'newPost') {
      form.setAttribute('type', 'newPost');
      form.classList.remove('hide');
    }
  });
// *********************************************************
  function closeForm(form) {
    form.classList.add('hide');
    form.setAttribute('postId', '');
    form.setAttribute('type', '');
    let formTitle = form.querySelector('#form__title');
    let formBody = form.querySelector('#form__body');
    formTitle.value = '';
    formBody.value = '';
  }
  function saveEditPostForm(form) {
    let postId = form.getAttribute('postId');
    let post = document.getElementById(postId);
    let postTitle = post.getElementsByClassName('post__title')[0];
    let postBody = post.getElementsByClassName('post__body')[0];
    let postDateModified = post.getElementsByClassName('post__dateModified')[0];
    form.classList.add('hide');

    let formTitle = form.querySelector('#form__title');
    let formBody = form.querySelector('#form__body');
    form.setAttribute('postId', '');
    form.setAttribute('type', '');

    let date = new Date();
    postTitle.innerText = formTitle.value;
    postBody.innerText = formBody.value;
    postDateModified.innerText = 'Date modified: ' + timeToDate(date.getTime());
    let dataObj = {id: postId, title: formTitle.value, body: formBody.value, dateModified: date.getTime()};

    editPost(postId, dataObj);
  }
  function editPostForm(post) {
    let postId = post.id;
    let postTitle = post.getElementsByClassName('post__title')[0];
    let postBody = post.getElementsByClassName('post__body')[0];
    let form = document.getElementById('form__background');
    form.classList.remove('hide');

    let formTitle = form.querySelector('#form__title');
    let formBody = form.querySelector('#form__body');

    form.setAttribute('postId', postId);
    form.setAttribute('type', 'edit');
    formTitle.value = postTitle.innerText;
    formBody.value = postBody.innerText;
  }
// *********************************************************
  function editPost(id, dataObj) {
    let xhr = new XMLHttpRequest();

    xhr.open('PATCH', '/posts/' + id);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify(dataObj));

    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;
      if (xhr.status === 200) {
        console.log(xhr.responseText);
      } else {
        console.log('Error ' + xhr.statusText);
      }
    };
  }
  function addPost(form) {
    let formTitle = form.querySelector('#form__title');
    let formBody = form.querySelector('#form__body');
    let date = new Date();
    let dataObj = {
      title: formTitle.value,
      body: formBody.value,
      dateCreated: date.getTime(),
      dateModified: 0
    };
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/posts');
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify(dataObj));

    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;
      if (xhr.status === 201) {
        console.log(xhr.responseText);
        closeForm(form);
        addPostToPage(xhr.responseText);
      } else {
        console.log('Error ' + xhr.statusText);
      }
    };
  }
  function getPosts() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/posts');
    xhr.send();

    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;
      if (xhr.status === 200) {
        console.log(xhr.responseText);
        addPostToPage(xhr.responseText);
      } else {
        console.log('Error ' + xhr.statusText);
      }
    };
  }
  function deletePost(id, post) {
    let xhr = new XMLHttpRequest();
    xhr.open('DELETE', '/posts/' + id);
    xhr.send();

    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;
      if (xhr.status === 200) {
        console.log(xhr.responseText);
        post.parentNode.removeChild(post);
      } else {
        console.log('Error ' + xhr.statusText);
      }
    };
  }
// *********************************************************
  function addPostToPage(postData) {
    let data = JSON.parse(postData);
    if (data.length >= 0) {
      data.sort(function(a, b) {
        if (a.dateCreated > b.dateCreated) {
          return -1;
        }
        if (a.dateCreated < b.dateCreated) {
          return 1;
        }
        return 0;
      });
      for (let i = 0; i < data.length; i++) {
        createPost(data[i], false);
      }
    } else {
      createPost(data, true);
    }
  }
  function createPost(data, single) {
    let post = document.createElement('div');
    post.className = 'post';
    post.id = data.id;

    let title = document.createElement('h1');
    title.innerText = data.title;
    title.className = 'post__title';

    let dropDownContainer = document.createElement('div');
    dropDownContainer.classList.add('post__dropDownContainer');

    let text = document.createElement('p');
    text.className = 'post__body';
    text.innerText = data.body;

    let arrow = document.createElement('i');
    arrow.className = 'post__arrowDown';

    let dropDownContent = document.createElement('ul');
    dropDownContent.classList.add('post__dropDown', 'hide');

    let edit = document.createElement('li');
    edit.innerText = 'Edit';
    edit.className = 'post__dropDownContent';

    let del = document.createElement('li');
    del.innerText = 'Delete';
    del.className = 'post__dropDownContent';

    let dateCreated = document.createElement('p');
    dateCreated.innerText = 'Date created: ' + timeToDate(data.dateCreated);
    dateCreated.classList.add('post__date', 'post__dateCreated');

    let dateModified = document.createElement('p');
    if (data.dateModified !== 0) {
      dateModified.innerText = 'Date modified: ' + timeToDate(data.dateModified);
    }
    dateModified.classList.add('post__date', 'post__dateModified');

    dropDownContent.append(edit);
    dropDownContent.append(del);
    dropDownContainer.append(arrow);
    dropDownContainer.append(dropDownContent);
    post.append(dropDownContainer);
    post.append(title);
    post.append(text);
    post.append(dateCreated);
    post.append(dateModified);

    let posts = document.getElementById('posts');
    if (single) {
      posts.insertBefore(post, posts.firstChild);
    } else {
      posts.appendChild(post);
    }
  }
})();
// *********************************************************
function timeToDate(nr) {
  let date = new Date(nr);
  return date.toDateString() + ' kl:' + date.toLocaleTimeString().slice(0, 5);
}