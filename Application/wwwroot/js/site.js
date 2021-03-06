﻿// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.


//Feedback
async function GetFeedbackData() {
    const feedbackAgree = document.getElementById("f-check");
    let success = document.getElementById("feedbackSuccess"); 
    let errEmail = document.getElementById("f-err-email");
    let errText = document.getElementById("f-err-text");
    let errAgree = document.getElementById("f-err-agree")
    if(feedbackAgree.checked){
        errAgree.textContent = "";
        const FeedbackEmail = document.getElementById("FeedbackEmail").value;
        const FeedbackText = document.getElementById("FeedbackText").value;
        
        const url = '/home/feedback';
        let data = { Email: FeedbackEmail, Text: FeedbackText};
        const response = await fetch(url, {
            method: 'POST', 
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json'
            }
            
        });
        let messages = await response.json();
        if (response.ok) {   
            
            console.log(response);
            console.log(messages);
            if(messages.Success){
                errEmail.textContent = "";
                errText.textContent = "";
                errAgree.textContent = "";
                success.style.display = "block";
            }else{
                success.style.display = "none";
                errEmail.textContent = messages.ErrEmail;
                errText.textContent = messages.ErrText;
            }
        }else{
        console.log("Fail");
        }
    }else{
        errAgree.textContent = "To send data, you must agree to the processing of personal data";
    }

}
async function ClickLike(element){
    console.log(element.dataset.postId);
    let countLikes = document.getElementById("count-likes");
    const url = '/Ajax/Like';
    let data = { PostId: element.dataset.postId, Status: element.dataset.status};
    const response = await fetch(url, {
        method: 'POST', 
        body: JSON.stringify(data),
        headers: {
        'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        if(element.dataset.status == 'false'){
            element.nextElementSibling.innerHTML++;
            element.setAttribute('fill','Red');
            element.dataset.status = 'true';
        }else{
            element.nextElementSibling.innerHTML--;
            element.setAttribute('fill','DarkGray');
            element.dataset.status = 'false';
        }
    }
    
}

//add comment
async function addComment(){
    let helpAnimation = document.getElementById('help-animation');
    let commentsBlock = document.getElementById('comment-block');
    let input = document.getElementById("input-comment");
    let error = document.getElementById('error-add-comment');
    const url = '/Ajax/AddComment';
    const data = { PostId: parseInt(input.dataset.postId), Text: input.value};
    const response = await fetch(url, {
        method: 'POST', 
        body: JSON.stringify(data),
        headers: {
        'Content-Type': 'application/json'
        }
    });
    let commentMessage = await response.json();
    if (response.ok && commentMessage.error == null) {
        if(error!=null){
            error.classList.remove('invalid-feedback'); 
            error.classList.add('valid-feedback');
            error.innerHTML = 'Success';
        }
        let commentsArea = document.getElementById('comments');
        if(commentsArea == null){
            commentsArea = document.createElement('div');
            commentsArea.id = "comments";
            commentsBlock.append(commentsArea);
        }
        let comment = document.createElement('div');
        let avatarBlock = document.createElement('div');
        let avatar = document.createElement('img');
        let text = document.createElement('div');
        let line = document.createElement('hr');
        let nameAndText = document.createElement('div');
        let nameAndDate = document.createElement('div');
        let userName = document.createElement('a');
        let date = document.createElement('div');

        avatarBlock.className = 'avatar mr-3';
        avatar.src = '';
        avatar.className = 'img-avatar';

        nameAndDate.className = 'row ml-1';
        date.className = "text-secondary";
        text.className = "comment-text ml-1";
        line.className = "mx-2";
        comment.id = "comment";
        comment.className = "ml-4 row";
        userName.href = "/User/Index/"+commentMessage.id;
        userName.innerHTML = commentMessage.userName;
        text.innerHTML = commentMessage.text;
        date.innerHTML = "&nbsp;&nbsp;" + commentMessage.date;
        

        nameAndDate.prepend(userName);
        nameAndDate.append(date);
        nameAndText.append(nameAndDate);
        nameAndText.append(text);
        avatarBlock.prepend(avatar);
        comment.prepend(avatarBlock);
        comment.append(nameAndText);
        commentsArea.prepend(comment);
        commentsArea.prepend(line);
        helpAnimation.style.height = commentsBlock.offsetHeight + 'px';
    }else if(commentMessage.error != null){
        if(error != null){
            error.classList.remove('valid-feedback');
            error.classList.add('invalid-feedback'); 
            error.innerHTML = commentMessage.error;
        }
    }
}
//getComment
async function getComments(){
    let commentsBlock = document.getElementById('comment-block');
    const url = '/Ajax/GetComments';
    const data = parseInt(commentsBlock.dataset.postId);
    const response = await fetch(url, {
        method: 'POST', 
        body: JSON.stringify(data),
        headers: {
        'Content-Type': 'application/json'
        }
    });
    let comments = await response.json();
    if (response.ok) {
        return comments;
    }
    return false;
}
//view comments
async function viewComments(){
    let commentsBlock = document.getElementById('comment-block');
    let helpAnimation = document.getElementById('help-animation');
    let buttonView = document.getElementById('button-view');
    buttonView.remove();
    helpAnimation.style.height = 0;
    //comments.insertAdjacentElement('afterbegin', buttonView);
    commentsBlock.insertAdjacentHTML('afterbegin','<h5 class = "ml-1">Comments</h5>');
    commentsBlock.insertAdjacentHTML('beforeend','<div class="input-group add-comment-area"><input type="text" id="input-comment" class="form-control" placeholder="Your comment" data-post-id="'+commentsBlock.dataset.postId+'"> <div class="input-group-append"><button class="btn btn-success" type="button" id="add-comment" onclick="addComment()"> Add </button> </div><div id="error-add-comment" class = "d-block ml-1"><span asp-validation-for="Description"></span></div> </div>');
    let comments = await getComments();
    if(comments.length > 0){
        console.log(comments);
        let commentsArea = document.createElement('div');
        
        commentsArea.id = "comments";
        for(i = 0; i < comments.length; i++){
            let comment = document.createElement('div');
            let avatarBlock = document.createElement('div');
            let avatar = document.createElement('img');
            let text = document.createElement('div');
            let line = document.createElement('hr');
            let nameAndText = document.createElement('div');
            let nameAndDate = document.createElement('div');
            let userName = document.createElement('a');
            let date = document.createElement('div');

            avatarBlock.className = 'avatar mr-3';
            avatar.src = '';
            avatar.className = 'img-avatar';

            nameAndDate.className = 'row ml-1';
            date.className = "text-secondary";
            text.className = "comment-text ml-1";
            line.className = "mx-2";
            comment.id = "comment";
            comment.className = "ml-4 row";

            userName.href = "/User/Index/"+comments[i].id;
            date.innerHTML = "&nbsp;&nbsp;" + comments[i].date;
            userName.innerHTML = comments[i].userName;
            text.innerHTML = comments[i].text;

            nameAndDate.prepend(userName);
            nameAndDate.append(date);
            nameAndText.append(nameAndDate);
            nameAndText.append(text);
            avatarBlock.prepend(avatar);
            comment.prepend(avatarBlock);
            comment.append(nameAndText);
            commentsArea.prepend(comment);
            commentsArea.prepend(line);
        }
        commentsBlock.append(commentsArea);
    }
    animate({
        duration: 700,
        timing(timeFraction) {
            return Math.pow(timeFraction, 2);
        },
        draw(progress) {
            helpAnimation.style.height = progress * commentsBlock.offsetHeight + 'px';
        }
    });
}


//animation
function animate(options) {

    var start = performance.now();
  
    requestAnimationFrame(function animate(time) {
      
      var timeFraction = (time - start) / options.duration;
      if (timeFraction > 1) timeFraction = 1;
  
      
      var progress = options.timing(timeFraction)
      
      options.draw(progress);
  
      if (timeFraction < 1) {
        requestAnimationFrame(animate);
      }
  
    });
  }