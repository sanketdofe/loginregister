import React, {useEffect} from "react";
import { makeStyles } from '@mui/styles';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import DatePicker from '@mui/lab/DatePicker';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

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
export default function Home() {
    let accesstoken = sessionStorage.getItem("accesstoken");
    const navigate = useNavigate();
    const [loggedIn, setLoggedIn] = React.useState(accesstoken !== null);
    const [viewing, setViewing] = React.useState(true);
    const [updatepassword, setUpdatepassword] = React.useState(false);
    const [user, setUser] = React.useState({
        name: "",
        email: "",
        password: "",
        newpassword: "",
        reenterednewpassword: "",
        dob: ""
    });
    const classes = useStyles();
    useEffect(() => {
        if(!loggedIn){
            alert("Please login again");
            navigate("/");
        }
        axios.get(serveraddress+"/api/user/getuser", { headers: {authorization: "Bearer " + accesstoken}})
        .then(res => {
            if(res.data.message === 'jwt expired' || res.data.message === 'Access token required'){
                alert("You have been logged out");
                sessionStorage.removeItem("accesstoken");
                sessionStorage.removeItem("name");
                sessionStorage.removeItem("userid");
                setLoggedIn(false);
            }
            else if(res.data.message === 'User Found'){
                setUser({
                    email: res.data.email, 
                    name: res.data.name,
                    password: "",
                    newpassword: "",
                    reenterednewpassword: "",
                    dob: res.data.dob
                });
            }
        })
        .catch(err => {console.error(err)});
    }, [accesstoken, loggedIn, navigate]);

    function handleChange(event){
        // console.log(user);
        setUser({ ...user, [event.target.name]: event.target.value});
    };
    
    function handleUpdate(e){
        e.preventDefault();
        if(user.email === ''){
            alert("Email cannot be empty");
        }
        else if(user.name === ''){
            alert("Name cannot be empty");
        }
        else{
            axios.put(serveraddress+"/api/user/updateuser", {email: user.email, name: user.name}, { headers: {authorization: "Bearer " + accesstoken}})
            .then(res => {
                // console.log(res);
                if(res.data.message === 'jwt expired' || res.data.message === 'Access token required'){
                    sessionStorage.removeItem("accesstoken");
                    sessionStorage.removeItem("name");
                    sessionStorage.removeItem("userid");
                    alert("You have been logged out, please login again");
                    setLoggedIn(false);
                    navigate("/");
                }
                else if(res.data.message === 'Update Successful'){
                    alert(res.data.message);
                    navigate('/home');
                }
            })
            .catch(err => {console.error(err)});
        }
    };
    function handleUpdatePassword(e){
        e.preventDefault();
        if(user.password === '' || user.newpassword === '' || user.reenterednewpassword === ''){
            alert("Fields cannot be empty");
        }
        else if(user.newpassword !== user.reenterednewpassword){
            alert("Both Passwords should be same. Please try again.");
            setUser({
                ...user,
                password: "",
                newpassword: "",
                reenterednewpassword: ""
            });
            return;
        }
        else{
            axios.put(serveraddress+"/api/user/updatepassword", {oldpassword: user.password, newpassword: user.newpassword}, { headers: {authorization: "Bearer " + accesstoken}})
            .then(res => {
                // console.log(res);
                if(res.data.message === 'jwt expired' || res.data.message === 'Access token required'){
                    sessionStorage.removeItem("accesstoken");
                    sessionStorage.removeItem("name");
                    sessionStorage.removeItem("userid");
                    alert("You have been logged out");
                    setLoggedIn(false);
                    navigate("/");
                }
                else if(res.data.message === 'Current password Incorrect'){
                    alert(res.data.message);
                    setUser({
                        ...user,
                        password: "",
                        newpassword: "",
                        reenterednewpassword: ""
                    });
                    return;
                }
                else if(res.data.message === 'Password updated successfully'){
                    alert(res.data.message);
                    navigate('/home');
                }
            })
            .catch(err => {console.error(err)});
        }
    };

    const nameemail = 
        <div>
            <TextField disabled={viewing} className={classes.textfield} value={user.name} onChange={handleChange} required name="name" label="Name" />
            <TextField disabled={viewing} className={classes.textfield} value={user.email} onChange={handleChange} required type="email" name="email" label="Email" />
        </div>

    const updatepassworddata = 
        <div>
            <TextField className={classes.textfield} value={user.password} onChange={handleChange} required type="password" name="password" label="Current Password" />
            <TextField className={classes.textfield} value={user.newpassword} onChange={handleChange} required type="password" name="newpassword" label="New Password" />
            <TextField className={classes.textfield} value={user.reenterednewpassword} onChange={handleChange} required type="password" name="reenterednewpassword" label="Reenter New Password" />
        </div>

    const viewinguserbutton = 
        <div>
            <Button size="small" variant='outlined' onClick={() => setViewing(false)} className={classes.button} style={{backgroundColor: '#34656d',color: "#FFFFFF"}}>Edit</Button>
            <Button size="small" variant='outlined' onClick={() => navigate('/')} className={classes.button} style={{backgroundColor: '#34656d',color: "#FFFFFF"}}>Go Home</Button>
        </div>
    
    const editinguserbutton = 
        <div>
            <Button size="small" variant='outlined' onClick={handleUpdate} className={classes.button} style={{backgroundColor: '#34656d',color: "#FFFFFF"}}>Update</Button>
            <Button size="small" variant='outlined' onClick={() => setUpdatepassword(true)} className={classes.button} style={{backgroundColor: '#34656d',color: "#FFFFFF"}}>Update Password</Button>
            <Button size="small" variant='outlined' onClick={() => {setViewing(true); setUpdatepassword(false)}} className={classes.button} style={{backgroundColor: '#34656d',color: "#FFFFFF"}}>Cancel</Button>
        </div>

    const passwordupdatebutton = 
        <div>
            <Button size="small" variant='outlined' onClick={handleUpdatePassword} className={classes.button} style={{backgroundColor: '#34656d',color: "#FFFFFF"}}>Update</Button>
            <Button size="small" variant='outlined' onClick={() => {setUpdatepassword(false)}} className={classes.button} style={{backgroundColor: '#34656d',color: "#FFFFFF"}}>Cancel</Button>
        </div>
    
    return (
        <div className={classes.root}>
            <Card style={{padding: '20px'}}>
                <h1 className={classes.heading}>{user.name}'s Profile</h1>
                <div style={{textAlign: 'center'}}>
                    <FormControl required component="fieldset" className={classes.formControl}>
                        {updatepassword ? updatepassworddata: nameemail}
                        {viewing ? viewinguserbutton : (updatepassword ? passwordupdatebutton : editinguserbutton)}
                    </FormControl>
                </div>
            </Card>
        </div>
    );
}