import React, { Component } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Picker, TouchableOpacity, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { SearchBar } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage'

import MovieList from '../components/MovieList';
import MovieDetail from '../components/MovieDetail';
import { getPopularMovies, getHighestRatedMovies, getUserLikes, searchMovieByName, searchMovieByActorName, loginUserDB ,searchMovieById, likeMovie, dislikeMovie } from '../api/dbo';

const SEARCH_KEY_DEFAULT = '';
const SEARCH_CAT_DEFAULT = 'movieName';
const SCREEN_WIDTH = Dimensions.get('window').width;

class MainScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userNameError: false,
      userNameInput: '',
      userName: '',
      userId: -1,
      mostPopular: [],
      highestRated: [],
      userLikes: [],
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
    let [mostPopular, highestRated ] = await Promise.all(
      [getPopularMovies(), getHighestRatedMovies()]
      );
    
    // update result and end loading
    this.setState({mostPopular, highestRated, isLoading: false});
  }

  // #endregion

  // #region Fav Movies

  fetchFavoriteMovies = async () => {
    // get all the ids of the movies that the user liked but not added yet
    const { userId } = this.state;
    const movieIds = (await getUserLikes(userId)).map((obj) => obj.id);

    // fetch details of all the movies
    const userLikes = [];
    for (let i = 0; i < movieIds.length; i += 1) {
      const id = movieIds[i];
      const res = await searchMovieById(id);
      if (res.length === 1)
      userLikes.push(res[0]);
    }

    this.setState({userLikes});
  }

  onLikeMovieSelected = async (movieId) => {
    const { userId } = this.state;
    await likeMovie(userId, movieId);
    this.fetchFavoriteMovies();
  }

  onDislikeMovieSelected = async (movieId) => {
    const { userId } = this.state;
    await dislikeMovie(userId, movieId);
    this.fetchFavoriteMovies();
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

      // filter out the duplicate movies
      const searchResult = [];
      const idSet = new Set();
      for (let i = 0; i < res.length; i += 1) {
        if (!idSet.has(res[i].id)) {
          searchResult.push(res[i]);
          idSet.add(res[i].id);
        }
      }
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
    const { searchKey, userName, searchCategory, searchResult, selectedMovie } = this.state;

    if (selectedMovie || (!userName || userName === '')) {
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
          inputStyle={{padding: 5}}
          placeholder="Type Here..."
          onChangeText={(text) => this.setState({searchKey: text, searchResult: null})}
          onClear={() => this.setState({searchKey: SEARCH_KEY_DEFAULT, searchResult: null})}
          value={searchKey}
          onSubmitEditing={() => this.searchMovie()}
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
          <Text style={{color: 'white'}}>{userName}</Text>
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
    <View style={{alignSelf: 'center', marginTop: 'auto', marginBottom: 'auto', width: 300}}>
      <Text style={{color: 'white', font: 24}}>What is your userName?</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, backgroundColor: 'white'}}
        onChangeText={userNameInput => {this.setState({userNameInput})}}
        value={this.state.userNameInput}
      />
      <Button
        title="LOGIN"
        onPress={() => this.login()}
      />
      {
        this.state.userNameError ? 
        (
          <Text style={{color:'red'}}>Username should be less than 10 characters.</Text>
        ) : null
      }
    </View>
  )

  login = async () => {
    // get the user's input email in the text input element
    const { userNameInput } = this.state;

    if (!userNameInput || userNameInput === '') {
      return;
    }

    if (userNameInput.length >= 10) {
      this.setState({userNameError: true});
      return;
    }

    this.setState({userNameError: false});

    // try loginDB
    const res = await loginUserDB(userNameInput);
    if (res && !res.error) {
      try {
        const userId = res.id;
        const userName = userNameInput;
        await AsyncStorage.setItem('userName', userName);
        await AsyncStorage.setItem('userId', userId);
        this.setState({ userName, userId });
        this.fetchFavoriteMovies();
      } catch (error) {
        console.log(error);
      }
    };
  }

  autoLogin = async() => {
    try {
      const userName = await AsyncStorage.getItem('userName');
      const userId = await AsyncStorage.getItem('userId');
      if (userName && userId) {
        this.setState({ userName, userId }, () => {
          this.fetchFavoriteMovies();
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  logout = () => {
    this.setState({userName: null, userId: -1});
    AsyncStorage.removeItem('userName', (error) => {
      if (error) {
        console.log(error);
      }
    });

    AsyncStorage.removeItem('userId', (error) => {
      if (error) {
        console.log(error);
      }
    });
  }

  // //#endregion

  renderMainSection = () => {
    const { userName, userId, selectedMovie, searchKey, searchResult, mostPopular, highestRated, userLikes, isLoading } = this.state;

    // update favorite movies
    if (isLoading) {
      return <Text style={{fontSize: 30, color: 'white'}}>Searching...</Text>
    } else if (!userName || userName === '' || userId === -1) {
      return this.renderLogin();
    }
    else if (selectedMovie) {
      return (
        <MovieDetail
          userName={userName}
          movie={selectedMovie}
          onClose={() => this.setState({selectedMovie: null})}
          userLikes={userLikes}
          like={this.onLikeMovieSelected}
          dislike={this.onDislikeMovieSelected}
        />
      )
    } else if (searchResult) {
      const title = `Results for ${searchKey}`;
      return (
        <>
          <Text style={{fontSize: 26, color:'white', marginLeft: 20}}>{title}</Text>
          <MovieList
            shouldValidate={true}
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
              shouldValidate={true}
              movies={mostPopular}
              isHorizontal={true}
              onMovieSelected={(selectedMovie) => this.setState({selectedMovie})}
            />
          </View>
          <View style={{margin: 20}}>
            <Text style={{fontSize: 26, color: 'white', fontWeight: 'bold'}}>Highest Rated</Text>
            <MovieList
              shouldValidate={true}
              movies={highestRated}
              isHorizontal={true}
              onMovieSelected={(selectedMovie) => this.setState({selectedMovie})}
            />
          </View>
          <View style={{margin: 20}}>
            <Text style={{fontSize: 26, color: 'white', fontWeight: 'bold'}}>Your Favorite Movies</Text>
            <MovieList
              shouldValidate={false}
              movies={userLikes}
              isHorizontal={true}
              onMovieSelected={(selectedMovie) => this.setState({selectedMovie})}
            />
          </View>
        </>
      )
    }
  }

  render() {
    const { searchResult, isLoading, userId, userLikes } = this.state;

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
  }
})

export default MainScreen;