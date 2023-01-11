import React from 'react';
import { useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Fab from '@material-ui/core/Fab';
import SendIcon from '@material-ui/icons/Send';
import ReactMarkdown from 'react-markdown'
import CircularProgress from '@material-ui/core/CircularProgress';
import tablemark from "tablemark"
import remarkGfm from 'remark-gfm'
import axios from 'axios';

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
    chatSection: {
        width: '100%',
        height: '100vh'
    },
    headBG: {
        backgroundColor: '#e0e0e0'
    },
    borderRight500: {
        borderRight: '1px solid #e0e0e0'
    },
    messageArea: {
        height: '87vh',
        overflowY: 'auto'
    }
});

const Chat = () => {
    const classes = useStyles();
    const [message, setMessage] = useState('');
    const chatWindowRef = useRef(null);
    //let message = '';
    const [chat, setChat] = useState([
    ])
    const [isLoading, setIsLoading] = useState(false);

    function handleChange(event) {
        setMessage(event.target.value);
    }
    function keyPress(e) {
        if (e.keyCode == 13) {
            addMessage('ME', message);
        }
    }

    async function addMessage(from, msg) {
        if (msg.trim() === '') return

        // get the current time hh:mm
        const time = new Date().toLocaleTimeString().slice(0, 5)
        setChat([...chat, { from, msg, time }])
        setMessage('')
        setTimeout(() => {
            chatWindowRef.current.scrollTo(0, chatWindowRef.current.scrollHeight);
        }, 200);

        //chatWindowRef.current.scrollTo(0, chatWindowRef.current.scrollHeight);
        if (from === 'ME') {
            // send the message to the server
            try {
                setIsLoading(true);
                const response = await axios.post('/generate/', {
                    "text": msg,
                    "generate_tokens_limit": 100,
                    "top_p": 0.7,
                    "top_k": 0,
                    "temperature": 1.0
                })
                const data = response.data.completion
                //const data = await response.json();
                setIsLoading(false);
                //console.log(response)
                //console.log(data)
                // add the response from the server to the chat
                setChat([...chat, { from, msg, time }, { from: 'AI', msg: data, time }])
                chatWindowRef.current.scrollTo(0, chatWindowRef.current.scrollHeight);
            } catch (error) {
                console.error(error);
            }
        }

    }
    return (
        <div>
            {isLoading && <CircularProgress style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            }} />}

            <Grid container component={Paper} className={classes.chatSection}>

                <Grid item xs={12}>
                    <List className={classes.messageArea} ref={chatWindowRef}>
                        {chat.map((c, i) =>

                            <ListItem key={i}>
                                <Grid container>
                                    <Grid item xs={12}>

                                        <ListItemText align={c.from === 'AI' ? 'left' : 'right'} primary={<ReactMarkdown remarkPlugins={[remarkGfm]}>{c.msg}</ReactMarkdown>}> </ListItemText>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <ListItemText align={c.from === 'AI' ? 'left' : 'right'} secondary={c.from + ' at ' + c.time}></ListItemText>
                                    </Grid>
                                </Grid>
                            </ListItem>
                        )}

                    </List>
                    <Divider />
                    <Grid container style={{ padding: '20px' }}>
                        <Grid item xs={11}>
                            <TextField id="outlined-basic-email" InputProps={{
                                disableUnderline: true,
                            }} onChange={handleChange} onKeyDown={keyPress} value={message} label="Type Something" fullWidth />
                        </Grid>
                        <Grid xs={1} align="right">
                            <Fab color="primary" disabled={isLoading} onClick={async () => await addMessage('ME', message)} aria-label="add"><SendIcon /></Fab>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </div>
    );
}

export default Chat;