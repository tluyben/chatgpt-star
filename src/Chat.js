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
    const [tokens, setTokens] = useState(100);
    const [top_p, setTop_p] = useState(0.7);
    const [top_k, setTop_k] = useState(0);
    const [temperature, setTemperature] = useState(1.0);

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
                    "generate_tokens_limit": tokens,
                    "top_p": top_p,
                    "top_k": top_k,
                    "temperature": temperature
                })
                const data = response.data.completion
                if (!data && response.data.error) {
                    data = 'Error: ' + response.data.error
                }
                setIsLoading(false);

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

                <Grid item xs={10}>
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
                            <TextField id="chat-input" InputProps={{
                                disableUnderline: true,
                            }} onChange={handleChange} onKeyDown={keyPress} value={message} label="Type Something" fullWidth />
                        </Grid>
                        <Grid xs={1} align="right">
                            <Fab color="primary" disabled={isLoading} onClick={async () => await addMessage('ME', message)} aria-label="add"><SendIcon /></Fab>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={2} className={classes.borderRight500}>
                    <List>
                        <ListItem button key="RightHeader">
                            <ListItemText primary="Settings"></ListItemText>
                        </ListItem>
                    </List>
                    <Divider />

                    <List>
                        <ListItem button key="TokensItemHead">
                            <ListItemText primary="Tokens"></ListItemText>
                        </ListItem>
                        <ListItem button key="TokensItem">
                            <Slider
                                aria-label="Tokens"
                                defaultValue={100}
                                value={tokens}
                                valueLabelDisplay="auto"
                                step={50}
                                marks
                                min={50}
                                max={1000}
                                onChange={(event, newValue) => {
                                    setTokens(parseInt(newValue));
                                }}
                            />
                            {tokens}
                        </ListItem>
                        <ListItem button key="TemperatureHeader">
                            <ListItemText primary="Temperature"></ListItemText>
                        </ListItem>
                        <ListItem button key="RightHeader">
                            <Slider
                                aria-label="Temperature"
                                defaultValue={1}
                                value={temperature}
                                valueLabelDisplay="auto"
                                step={0.1}
                                marks
                                min={0}
                                max={1}
                                onChange={(event, newValue) => {
                                    setTemperature(newValue);
                                }}
                            />
                        </ListItem>
                        <ListItem button key="TopPItemHead">
                            <ListItemText primary="Top-p"></ListItemText>
                        </ListItem>
                        <ListItem button key="TopPItem">
                            <Slider
                                aria-label="TopP"
                                defaultValue={0.7}
                                value={top_p}
                                valueLabelDisplay="auto"
                                step={0.1}
                                marks
                                min={0}
                                max={1}
                                onChange={(event, newValue) => {
                                    setTop_p(newValue);
                                }}
                            />
                        </ListItem>

                        <ListItem button key="TopKItemHead">
                            <ListItemText primary="Top-k"></ListItemText>
                        </ListItem>
                        <ListItem button key="TopKItem">
                            <Slider
                                aria-label="TopK"
                                defaultValue={0}
                                value={top_k}
                                valueLabelDisplay="auto"
                                step={1}
                                marks
                                min={0}
                                max={tokens}
                                onChange={(event, newValue) => {
                                    setTop_k(parseInt(newValue));
                                }}
                            />
                        </ListItem>

                    </List>
                </Grid>
            </Grid>
        </div>
    );
}

export default Chat;