import React from "react";
import { makeStyles } from '@mui/styles';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

let serveraddress = "http://localhost:5000";
const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        margin: '10% 0'
    },
    formControl: {
        width: '100%',
    },
    button: {
        margin: '20px 10px',
        color: "#34656d",
        fontWeight: 600,
    },
    textfield: {
        fontColor:"#34656d",
        margin: "3px 0",
        width: "90%"
    },
    heading: {
        color: '#34656d', 
        textAlign: 'center'
    }
}));

export default function ForgotPwd() {
    const navigate = useNavigate();
    const classes = useStyles();
    const [state, setState] = React.useState({
        email: "",
        password: "",
        reenteredpassword: "",
        dob: null
    });

    function handleChange(event){
        // console.log(event.target.value)
        setState({ ...state, [event.target.name]: event.target.value});
    };
    
    function handleReset(){
        setState({ 
            ...state,
            email: "",
            password: "",
            reenteredpassword: "",
            dob: null
        });
    };

    function handleAuthenticateUser(){
        // console.log(state);
        if(state.dob === '' || state.email === ''){
            alert("Enter both Email and DOB");
            handleReset();
            return;
        }
        if(state.password === '' || state.reenteredpassword === ''){
            alert("Fields cannot be empty");
        }
        else if(state.password !== state.reenteredpassword){
            alert("Both Passwords should be same. Please try again.");
            setState({
                ...state,
                password: "",
                reenteredpassword: ""
            });
            return;
        }
        let data = {
            email: state.email,
            dob: state.dob,
            password: state.password
        }
        axios
        .post(serveraddress+"/api/user/forgotpwd/auth", data)
        .then((res) => {
            if(res.data.message === "Password updated successfully"){
                alert(res.data.message + ". Please Login Now")
                navigate("/");
            }else{
                alert(res.data.message);
                handleReset();
            }
        })
        .catch(err => {
            console.error(err);
        });
    }


    const authForm = (
        <div>
            <FormControl required component="fieldset" className={classes.formControl} sx={{w: 9/10}}>
                <TextField className={classes.textfield} style={{fontColor:"#34656d",margin: "8px 0", width: "100%"}} value={state.email} onChange={handleChange} required type="email" name="email" label="Email" />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        disableFuture
                        label="Date Of Birth"
                        openTo="year"
                        views={['year', 'month', 'day']}
                        value={state.dob}
                        onChange={(newValue) => {
                            setState({ 
                                ...state,
                                dob: newValue
                            });
                        }}
                        renderInput={(params) => <TextField {...params} />}
                    />
                </LocalizationProvider>
                <TextField className={classes.textfield} style={{fontColor:"#34656d",margin: "8px 0", width: "100%"}} value={state.password} onChange={handleChange} required type="password" name="password" label="New Password" />
                <TextField className={classes.textfield} style={{fontColor:"#34656d",margin: "8px 0", width: "100%"}} value={state.reenteredpassword} onChange={handleChange} required type="password" name="reenteredpassword" label="Reenter Password" />
                <div>
                    <Button size="small" variant='outlined' onClick={handleAuthenticateUser} className={classes.button} style={{margin: '20px 15px',fontWeight: 600, backgroundColor: '#34656d',color: "#FFFFFF"}}>Submit</Button>
                    <Button size="small" variant='outlined' onClick={handleReset} className={classes.button} style={{margin: '20px 15px',color: "#34656d",fontWeight: 600}}>Reset</Button>
                </div>
            </FormControl>
        </div>
    );

    return (
        <div className={classes.root} style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '10% 0'
        }}>
            <Card style={{padding: '20px'}}>
                <div style={{textAlign: 'center'}}>
                    <FormControl required component="fieldset" className={classes.formControl} sx={{w: 9/10}}>
                        {authForm}
                    </FormControl>
                </div>
            </Card>
        </div>
    )
}