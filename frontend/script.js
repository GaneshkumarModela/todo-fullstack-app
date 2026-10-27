async function signUp(){

    const username = document.getElementById("signup-username").value;
    const email = document.getElementById("signup-email").value;
    const pwd = document.getElementById("signup-pwd").value;

    document.getElementById("signup-username").value = "";
    document.getElementById("signup-email").value = "";
    document.getElementById("signup-pwd").value = "";

    try{
        const response = await axios.post(
            "http://localhost:3000/signup",
            {
                name : username,
                email : email,
                pwd : pwd
            });

        //Handling successful requests 
        alert(response.data.msg);

    }catch(error){

        console.log("sign-up failed:", error);

        if(error.response){

            console.log("error-response",error.response);
            
            //This is the important line of code to distinguish type of request failure
            const status = error.response.status;

            //Handling duplicate email request failures
            if(status === 409) alert(error.response.data.msg);

            //Handling bad data request failures - like invalid email address, too small 
            //usernames, not meeting pwd policy requirements
            else if(status === 400){
                /*error.response.data - gives response body */
                const errors = error.response.data.errors;
                alert(errors.join("\n"));
            } 
        }
    }
}

async function login(){

    try{

        const email = document.getElementById("login-email").value;
        const pwd = document.getElementById("login-pwd").value;

        document.getElementById("login-email").value = "";
        document.getElementById("login-pwd").value = "";

        const response = await axios.post(
            "http://localhost:3000/login",
            {email,pwd}
        );

        //store JWT
        localStorage.setItem("token", response.data.token);
        alert("login-successful");
        console.log("token",localStorage.getItem("token"));
        //Hide Auth
        document.getElementById("auth-section").style.display = "none";
        //show todos
        document.getElementById("todoSection").style.display = "block";
        //load todos
        getToDos();

    }catch(error){

        console.log("login failed: ",error); 

        if(error.response){

            console.log("error-response:",error.response);

            const status = error.response.status;

            if(status === 401) alert(error.response.data.msg);
        } 
    }

}

function displayToDos(response){
    
    console.log(response.data);//Array of todos
    const toDosArr = response.data;

    const toDoContainer = document.getElementById("todoList");
    toDoContainer.innerHTML = "";

    toDosArr.forEach(toDo => {

        //create <li>
        const li = document.createElement("li");

        //create checkbox 
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = toDo.completed;

        //onchange
        checkbox.addEventListener("change",()=>{
            toggleToDO(toDo._id, checkbox.checked);
        })

        //create task/span
        const span = document.createElement("span");
        span.innerText = toDo.task;
        if(toDo.completed) span.classList.add("completed");
        if(!toDo.completed) span.classList.remove("completed");

        //create edit button
        const editButton = document.createElement("button");
        editButton.innerText = "Edit";

        //onClicking Edit Button
        editButton.addEventListener("click",()=>{
            updateToDo(toDo.task, toDo._id);  
        })

        //create delete button
        const deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";

        //onClicking Delete Button
        deleteButton.addEventListener("click",()=>{
            deleteToDo(toDo._id);
        })


        //add all of them to li
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(editButton);
        li.appendChild(deleteButton);

        //add li to the final ul
        toDoContainer.appendChild(li);

    });
}

async function getToDos(){

    //response will be an array of todo objects
    const response = await axios.get(
        "http://localhost:3000/todos",
        {headers:{token:localStorage.getItem("token")}}
    )
    //once it get response(userToDos) from backend->DB
    //i have to render them on to the screen
    displayToDos(response);
}

async function addToDo(){

    const toDo = document.getElementById("todoInput").value;

    //Handling if user doesn't give toDo, but trying to add toDo
    if(toDo.trim() === ""){
        alert("please enter toDo to proceed");
        return;
    }
    document.getElementById("todoInput").value = "";

    await axios.post(
        "http://localhost:3000/addToDo",
        {task:toDo},
        {headers:{token:localStorage.getItem("token")}}
    )
    
    getToDos();
}

async function updateToDo(task, id){

    const newTask = prompt("update Existing toDo", task);

    await axios.put(
        "http://localhost:3000/updateToDo",
        {id : id, task : newTask},
        {headers : {token : localStorage.getItem("token")}}
    );
    getToDos();
}


//To mark toDo as Done
async function toggleToDO(id, isCompleted){

    await axios.put(
        "http://localhost:3000/updateToDo",
        {id:id, completed : isCompleted},
        {headers : {token : localStorage.getItem("token")}}
    )

    getToDos();
}

async function deleteToDo(id){

    await axios.delete(
        "http://localhost:3000/deleteToDo",
        {
            headers : {token : localStorage.getItem("token")},
            data : {id : id}
        }
    );
    getToDos();
}

function logout(){

    localStorage.removeItem("token");
    document.getElementById("todoSection").style.display = "none";
    document.getElementById("auth-section").style.display = "block";
}