import React from 'react';
import './App.css';
import {Switch, Route, withRouter, Redirect} from 'react-router-dom';
import Form from './components/Form';
import Home from './components/Home';
import AddRecipeForm from './components/AddRecipeForm';

class App extends React.Component {

  state = {
    id: 0,
    username: "",
    boards: [],
    recipes: [],
    token: "",
    filter: "",
    recipes: [],
  }

  componentDidMount(){
    if(localStorage.token){
      fetch("http://localhost:3000/me", {
        headers: {
          "authorization": localStorage.token
        }
      })
        .then(res=>res.json())
        .then(this.handleResponse)
    }
  }

  handleLoginSubmit = (userInfo) => {
    console.log("Login form has been submitted")
    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        username: userInfo.username,
        password: userInfo.password
      })
    })
    .then(res => res.json())
    .then(this.handleResponse)
  }

  handleRegisterSubmit = (userInfo) => {
    console.log("Register form has been submitted")
    fetch("http://localhost:3000/users", {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        username: userInfo.username,
        password: userInfo.password
      })
    })
    .then(res => res.json())
    .then(this.handleResponse)
  }

  addRecipe = (recipe) => {
    this.setState({
      recipes: [...this.state.recipes, recipe]
    })
  }

  addBoard = (board) => {
    this.setState({
      boards: [...this.state.boards, board]
    })
  }

  handleResponse = (resp) => {
    if(resp.token) {
      this.setState({
        id: resp.user.id,
        username: resp.user.username,
        boards: resp.user.boards,
        recipes: resp.user.recipes,
        token: resp.token
      })
      localStorage.token = resp.token

      this.props.history.push("/home")
    } else {
      alert(resp.errors)
    }
  }

  logOut = () => {
    this.setState({
      id: 0,
      username: "",
      boards: [],
      recipes: [],
      token: "",
    })
    localStorage.clear()
    this.props.history.push('/')
  }

  renderForm = (routerProps) => {
    if(routerProps.location.pathname === '/'){
      return <Form 
        formName= "log in"
        handleSubmit={this.handleLoginSubmit}
        formPar="don't have an account? sign up!"
        link="/signup"
      />
    } else if (routerProps.location.pathname === '/signup') {
      return <Form 
        formName= "create an account"
        handleSubmit={this.handleRegisterSubmit}
        formPar= "back to login"
        link="/"
      />
    }
  }

  renderHome = (routerProps) => {
    if (this.state.token) {
      return <Home 
        user = {this.state}
        logOut={this.logOut}
        deleteRecipe={this.deleteRecipe}
        filter={this.state.filter}
        updateFilterState={this.updateFilterState}
        arrayOfRecipes={this.newArrayOfRecipes}
      />
    } else {
      return <Redirect to="/login" />
    }
  }

  renderAddRecipeForm = (routerProps) => {
    if(this.state.token){
      return <AddRecipeForm 
        token = {this.state.token}
        user = {this.state}
        addRecipe = {this.addRecipe}
      />
    } else {
      return <Redirect to="/login" />
    }
  }

  updateFilterState= (value) => {
    this.setState({
      filter: value
    })
  }

  render() {
    let arrayOfRecipes = this.state.recipes
    let newArrayOfRecipes = arrayOfRecipes.filter((recipeObj) => { 
      return (recipeObj.recipe_title.toLowerCase().includes(this.state.filter.toLowerCase()))
      })

    return (
        <div className="app">
          <Switch>
            <Route path="/home" render={this.renderHome} />
            <Route exact path="/" render={this.renderForm} />
            <Route path="/signup" render={this.renderForm} />
            <Route path="/new-recipe" render={this.renderAddRecipeForm} />
            <Route render={ () => <p>Page not Found</p> } />
          </Switch>
        </div>
    );
  }
}

export default withRouter(App);
