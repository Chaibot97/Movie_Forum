import React, { Component } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Picker, TouchableOpacity, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { SearchBar } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage'

import MovieList from '../components/MovieList';
import MovieDetail from '../components/MovieDetail';
import { getPopularMovies, getHighestRatedMovies, getRecommendations, searchMovieByName, searchMovieByActorName, loginUserDB } from '../api/dbo';

const SEARCH_KEY_DEFAULT = '';
const SEARCH_CAT_DEFAULT = 'movieName';
const SCREEN_WIDTH = Dimensions.get('window').width;

class MainScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userEmailInput: '',
      userEmail: '',
      mostPopular: [],
      highestRated: [],
      recommendations: [],
      searchKey: SEARCH_KEY_DEFAULT,
      searchCategory: SEARCH_CAT_DEFAULT,
      searchResult: null,
      selectedMovie: null,
      isLoading: false
    }
  };

  componentDidMount() {
    // update movies
    this.fetchMovies();

    // auto login
    this.autoLogin();
  }

  // #region Fetch Movies
  fetchMovies = async () => {
    // start loading screen
    this.setState({isLoading: true});

    // fetch movies
    let [mostPopular, highestRated, recommendations] = await Promise.all(
      [getPopularMovies(), getHighestRatedMovies(), getRecommendations()]
      );
    
    // update result and end loading
    this.setState({mostPopular, highestRated, recommendations, isLoading: false});
  }

  // #endregion

  // #region Search Bar

  reset = () => {
    this.setState({searchKey: '', searchResult: null, selectedMovie: null});
  }

  searchMovie = async () => {
    const { searchKey, searchCategory } = this.state;

    if (searchKey && searchKey !== '') {
      this.setState({isLoading: true});
      const res = searchCategory === 'movieName' ? await searchMovieByName(searchKey) : await searchMovieByActorName(searchKey);
      this.setState({isLoading: false, searchResult: res});
    }
  }

  renderSearchIcon = () => {
    return (
      <TouchableOpacity onPress={() => this.searchMovie()}>
        <Image source={require('../assets/search.png')} style={{width: 30, height: 30}}/>
      </TouchableOpacity>
    )
  }

  renderHeader = () => {
    const { searchKey, userEmail, searchCategory, searchResult, selectedMovie } = this.state;

    if (selectedMovie || (!userEmail || userEmail === '')) {
      return (
        <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => this.reset()}
          style={{justifyContent: 'center', borderWidth: 2, borderColor: 'red', padding: 3}}>
          <Text style={{fontSize: 28, color: 'red', fontWeight: 'bold', fontFamily: 'Chalkduster'}}>Movie Forum</Text>
        </TouchableOpacity>
      </View>
      )
    }

    return (
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => this.reset()}
          style={{justifyContent: 'center', borderWidth: 2, borderColor: 'red', padding: 3}}>
          <Text style={{fontSize: 28, color: 'red', fontWeight: 'bold', fontFamily: 'Chalkduster'}}>Movie Forum</Text>
        </TouchableOpacity>
        <SearchBar
          searchIcon={this.renderSearchIcon()}
          containerStyle={{flex: 1, backgroundColor: 'black', paddingHorizontal: 20}}
          placeholder="Type Here..."
          onChangeText={(text) => this.setState({searchKey: text, searchResult: null})}
          onClear={() => this.setState({searchKey: SEARCH_KEY_DEFAULT, searchResult: null})}
          value={searchKey}
        />
        <Picker 
          selectedValue={searchCategory} style={{ height: 30, width: 120, color: 'white', backgroundColor: 'black'}}
          onValueChange={(category) => this.setState({searchCategory: category})}
        >
          <Picker.Item style={{color: 'white'}} label="Movie Name" value="movieName"/>
          <Picker.Item label="Actor Name" value="actorName"/>
        </Picker>
        <View style={{marginHorizontal: 15}}>
          <Text style={{color: 'white'}}>Welcome,</Text>
          <Text style={{color: 'white'}}>{userEmail}</Text>
        </View>
        <Button
          title='Logout'
          onPress={() => this.logout()}
        />
   
      </View>
    )
  }

  // #endregion

  // #region Login

  renderLogin = () => (
    <View style={{alignSelf: 'center', marginTop: 'auto', marginBottom: 'auto'}}>
      <Text style={{color: 'white', font: 24}}>What is your email address?</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, backgroundColor: 'white'}}
        onChangeText={userEmailInput => {this.setState({userEmailInput})}}
        value={this.state.userEmailInput}
      />
      <Button
        title="LOGIN"
        onPress={() => this.login()}
      />
    </View>
  )

  login = async() => {
    // get the user's input email in the text input element
    const { userEmailInput } = this.state;

    // store it locally
    try {
      AsyncStorage.setItem('userEmail', userEmailInput, (error) => {
        if (!error) {
          this.setState({userEmail: userEmailInput});
          loginUserDB(userEmailInput);
        }
      });
    } catch(e) {
      console.log(e);
    }
  }

  autoLogin = async() => {
    try {
      const userEmail = await AsyncStorage.getItem('userEmail');
      if (userEmail) {
        this.setState({userEmail});
      }
    } catch (e) {
      console.log(e);
    }
  }

  logout = () => {
    try {
      AsyncStorage.removeItem('userEmail', (error) => {
        if (!error) {
          this.setState({userEmail: null});
        }
      })
    } catch (e) {
      console.log(e);
    }
  }

  // //#endregion

  renderMainSection = () => {
    const { userEmail, selectedMovie, searchKey, searchResult, mostPopular, highestRated, recommendations, isLoading } = this.state;

    if (isLoading) {
      return <Text style={{fontSize: 30, color: 'white'}}>Searching...</Text>
    } else if (!userEmail || userEmail === '') {
      return this.renderLogin();
    }
    else if (selectedMovie) {
      return (
        <MovieDetail
          movie={selectedMovie}
          onClose={() => this.setState({selectedMovie: null})}
          userEmail={userEmail}
        />
      )
    } else if (searchResult) {
      const title = `Results for ${searchKey}`;
      return (
        <>
          <Text style={{fontSize: 26, color:'white', marginLeft: 20}}>{title}</Text>
          <MovieList
            movies={searchResult}
            isHorizontal={false}
            onMovieSelected={(selectedMovie) => this.setState({selectedMovie})}
          />
        </>
      )
    } else {
      return (
        <>
          <View style={{margin: 20}}>
            <Text style={{fontSize: 26, color: 'white', fontWeight: 'bold'}}>Most Popular</Text>
            <MovieList
              movies={mostPopular}
              isHorizontal={true}
              onMovieSelected={(selectedMovie) => this.setState({selectedMovie})}
            />
          </View>
          <View style={{margin: 20}}>
            <Text style={{fontSize: 26, color: 'white', fontWeight: 'bold'}}>Highest Rated</Text>
            <MovieList
              movies={highestRated}
              isHorizontal={true}
              onMovieSelected={(selectedMovie) => this.setState({selectedMovie})}
            />
          </View>
          <View style={{margin: 20}}>
            <Text style={{fontSize: 26, color: 'white', fontWeight: 'bold'}}>Pick For You</Text>
            <MovieList
              movies={recommendations}
              isHorizontal={true}
              onMovieSelected={(selectedMovie) => this.setState({selectedMovie})}
            />
          </View>
        </>
      )
    }
  }

  render() {
    const { searchResult, isLoading } = this.state;

    // get all the data from states
    return (
      <View style={styles.container}>
        {this.renderHeader()}
        <ScrollView 
          style={{flex: 1, backgroundColor: 'black'}}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={this.fetchMovies} />
          }
          >
          {this.renderMainSection()}
        </ScrollView>
      </View>
    )
  }    
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'black'
  },
})

export default MainScreen;