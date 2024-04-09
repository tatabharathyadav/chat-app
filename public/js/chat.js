const socket=io()



const form=document.querySelector('#message-form');
const input=form.querySelector('input')
const button=form.querySelector('button')
const $messages=document.querySelector('#messages')
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationmessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//options
const {username,room}=Qs.parse(location.search,{ ignoreQueryPrefix:true})


const autoscroll=()=>
{
     // New message element
     const $newMessage = $messages.lastElementChild

     // Height of the new message
     const newMessageStyles = getComputedStyle($newMessage)
     const newMessageMargin = parseInt(newMessageStyles.marginBottom)
     const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
 
     // Visible height
     const visibleHeight = $messages.offsetHeight
 
     // Height of messages container
     const containerHeight = $messages.scrollHeight
 
     // How far have I scrolled?
     const scrollOffset = $messages.scrollTop + visibleHeight
 
     if (containerHeight - newMessageHeight <= scrollOffset) {
         $messages.scrollTop = $messages.scrollHeight
     }
 
}

socket.on('message',(message)=>
{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(message)=>
{
    console.log(message)
    const html=Mustache.render(locationmessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.on('roomData',({room,users})=>
{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})


form.addEventListener('submit',(e)=>
{
    e.preventDefault();
    button.setAttribute('disabled', 'disabled')
    
    const message = e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>
    {
        button.removeAttribute('disabled');
        input.value=''
        input.focus()
        if(error)
        {
            return console.log(error)
        }
        console.log('The message was delivered!')

    });
})



const $sendlocationButton=document.querySelector('#send-location');

$sendlocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }
    $sendlocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position);
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>
    {
        $sendlocationButton.removeAttribute('disabled');
        console.log('location shared!')
    });
    }, (error) => {
        console.error('Error fetching geolocation:', error);
        // Handle error gracefully, such as displaying a message to the user
    });
});

socket.emit('join',{ username ,room },(error)=>
{
    if(error)
    {
        alert(error)
        location.href='/'
    }
})