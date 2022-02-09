import React, { useEffect } from "react";
import { makeStyles } from '@mui/styles';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

let serveraddress = "https://login-register-i.herokuapp.com";
const useStyles = makeStyles({
    root: {
        display: 'flex',
        justifyContent: 'center',
        margin: '10% 0'
    },
    switchbutton: {
        color: "#34656d",
        fontWeight: 600,
        fontSize: '18px',
        margin: '0 30px'
    },
    formControl: {
        width: '90%',
    },
    button: {
        margin: '20px 15px',
        color: "#34656d",
        fontWeight: 600,
    },
    textfield: {
        fontColor:"#34656d",
        margin: "8px 0"
    }
  });
export default function Login() {
    const [loggedIn, setLoggedIn] = React.useState(sessionStorage.getItem("accesstoken") !== null);
    const [tabactive, setTabactive] = React.useState(true);
    const [state, setState] = React.useState({
        name: "",
        email: "",
        password: "",
        reenteredpassword: "",
        dob: null
    });
    const classes = useStyles();
    const navigate = useNavigate();

    useEffect(() => {
        setLoggedIn(sessionStorage.getItem("accesstoken") !== null);
        if(loggedIn){
            alert('You are already Logged In');
            navigate('/home');
        }
        setState({
            name: "",
            email: "",
            password: "",
            reenteredpassword: "",
            dob: null
        });
    }, [loggedIn, navigate]);

    function handleChange(event){
        // console.log(event.target.value)
        setState({ ...state, [event.target.name]: event.target.value});
    };
    
    function handleReset(){
        setState({ 
            ...state,
            name: "",
            email: "",
            password: "",
            reenteredpassword: "",
            dob: null
        });
    };

    function handleRegister(e){
        e.preventDefault();
        // console.log(state);
        for(var item in state){
            if(state[item] === ''){
                alert(item + " cannot be empty");
                handleReset();
                return;
            }
        }
        if( state.password !== state.reenteredpassword){
            alert("Both Passwords are not identical. Please try again.");
            handleReset();
            return;
        }
        axios
        .post(serveraddress+"/api/user/adduser", state)
        .then((res) => {
            if(res.data.message === "User with same email already exists"){
                alert(res.data.message);
                handleReset();
            }
            else if(res.data.message === "User Added Successfully"){
                alert(res.data.message);
                setTabactive(true);
                handleReset();
            }
          })
          .catch(err => {
            console.error(err);
          });
    }

    function handleLogin(e){
        e.preventDefault();
        // console.log(state);
        if(state.email === '' || state.password === ''){
            alert("Enter both Email and Password");
            handleReset();
            return;
        }
        let data = {
            email: state.email,
            password: state.password,
            role: state.role
        }
        axios
        .post(serveraddress+"/api/user/authenticate", data)
        .then((res) => {
            // console.log(res);
            if(res.data.message === "No such User found. Please Register"){
                alert(res.data.message);
                setTabactive(false);
            }
            else if(res.data.message === "Wrong Password"){
                alert(res.data.message);
                handleReset();
            }
            else if(res.data.message === "Authentication Success"){
                sessionStorage.setItem("accesstoken", res.data.accesstoken);
                sessionStorage.setItem("name", res.data.name);
                sessionStorage.setItem("userid", res.data.userid);
                navigate('/home');
            }
          })
          .catch(err => {
            console.error(err);
          });
    }

    const RegisterForm = (
        <div>
            <FormControl required component="fieldset" className={classes.formControl} sx={{w: 9/10}}>
                <TextField className={classes.textfield} style={{fontColor:"#34656d",margin: "8px 0"}} value={state.name} onChange={handleChange} required name="name" label="Name" />
                <TextField className={classes.textfield} style={{fontColor:"#34656d",margin: "8px 0"}} value={state.email} onChange={handleChange} required type="email" name="email" label="Email" />
                <TextField className={classes.textfield} style={{fontColor:"#34656d",margin: "8px 0"}} value={state.password} onChange={handleChange} required type="password" name="password" label="Password" />
                <TextField className={classes.textfield} style={{fontColor:"#34656d",margin: "16px 0"}} value={state.reenteredpassword} onChange={handleChange} required type="password" name="reenteredpassword" label="Reenter Password" />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        style={{fontColor:"#34656d",margin: "8px 0"}}
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
                <div>
                    <Button size="small" variant='outlined' onClick={handleRegister} className={classes.button} style={{margin: '20px 15px',fontWeight: 600, backgroundColor: '#34656d',color: "#FFFFFF"}}>Sign Up</Button>
                    <Button size="small" variant='outlined' onClick={handleReset} className={classes.button} style={{margin: '20px 15px',color: "#34656d",fontWeight: 600}}>Reset</Button>
                </div>
            </FormControl>
        </div>
        
    );

    const LoginForm = (
        <div>
            <FormControl required component="fieldset" className={classes.formControl} sx={{w: 9/10}}>
                <TextField className={classes.textfield} style={{fontColor:"#34656d",margin: "8px 0"}} value={state.email} onChange={handleChange} required type="email" name="email" label="Email" />
                <TextField className={classes.textfield} style={{fontColor:"#34656d",margin: "8px 0"}} value={state.password} onChange={handleChange} required type="password" name="password" label="Password" />
                <div>
                    <Button size="small" variant='outlined' onClick={handleLogin} className={classes.button} style={{margin: '20px 15px',fontWeight: 600, backgroundColor: '#34656d',color: "#FFFFFF"}}>Login</Button>
                    <Button size="small" variant='outlined' onClick={handleReset} className={classes.button} style={{margin: '20px 15px',color: "#34656d",fontWeight: 600}}>Reset</Button>
                    <Button size="small" variant='outlined' onClick={() => navigate("/forgotpwd")} className={classes.button} style={{margin: '0 15px 20px',color: "#34656d",fontWeight: 600}}>Forgot Password</Button>
                </div>
            </FormControl>
        </div>
    );
    
    return (
        <>
        {
            !loggedIn ? 
            <div className={classes.root} style={{
                display: 'flex',
                justifyContent: 'center',
                margin: '10% 0'
            }}>
                <Card style={{padding: '20px'}}>
                    <div style={{textAlign: 'center'}}>
                        <h2 style={{textTransform:'uppercase', color: '#34656d'}}>{state.role}</h2>
                        <hr />
                        <Button size="large" className={classes.switchbutton} style={{color: !tabactive ? "#34656d" : "#808080", fontWeight: 600, fontSize: '18px', margin: '0 30px'}} onClick={() =>setTabactive(true)} disabled={tabactive}>Login</Button>
                        <Button size="large" className={classes.switchbutton} style={{color: tabactive ? "#34656d" : "#808080", fontWeight: 600, fontSize: '18px', margin: '0 30px'}} onClick={() => setTabactive(false)} disabled={!tabactive}>Register</Button>
                        <hr />
                        {tabactive ? LoginForm : RegisterForm}
                    </div>
                </Card>
            </div>
            : ''
        }
        </>
    );
}