import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, Picker, TouchableOpacity, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { SearchBar } from 'react-native-elements';

import MovieList from '../components/MovieList';
import MovieDetail from '../components/MovieDetail';
import { getPopularMovies, getHighestRatedMovies, getRecommendations, searchMovieByKey } from '../api/dbo';

const SEARCH_KEY_DEFAULT = '';
const SEARCH_CAT_DEFAULT = 'movieName';
const SCREEN_WIDTH = Dimensions.get('window').width;

class MainScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
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

  searchMovie = async () => {
    const { searchKey, searchCategory } = this.state;

    if (searchKey && searchKey !== '') {
      this.setState({isLoading: true});
      const res = await searchMovieByKey(searchKey, searchCategory);
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
    const { searchKey, searchCategory, searchResult, selectedMovie } = this.state;

    if (selectedMovie) {
      return (
        <View style={styles.header}>
        <View style={{justifyContent: 'center'}}>
          <Text style={{fontSize: 28, color: 'red'}}>Movie Forum</Text>
        </View>
      </View>
      )
    }

    return (
      <View style={styles.header}>
        <View style={{justifyContent: 'center'}}>
          <Text style={{fontSize: 28, color: 'red'}}>Movie Forum</Text>
        </View>
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
          <Picker.Item label="Crew Name" value="crewName"/>
        </Picker>
   
      </View>
    )
  }

  // #endregion

  renderTrendingMovie = () => {
    const { searchResult } = this.state;
    const imagePath = 'https://image.tmdb.org/t/p/original/4IzdfRrxgbvtnE0ZBNEjlcFcxgc.jpg';

    return (
      <View style = {{margin: 20}}>
        <View >
          <Image source={{uri: imagePath}} style={{height: (SCREEN_WIDTH - 40) / 2, width: SCREEN_WIDTH - 40, resizeMode: 'cover'}}/>
        </View>
        <View style={{position: 'absolute', left: 20, bottom: 20,}}>
          <Text style={{fontSize: 40, fontFamily: 'Iowan Old Style'}}>It's Okay to Not Be Okay</Text>
        </View>
      </View>
    )
  };

  renderMainSection = () => {
    const { selectedMovie, searchKey, searchResult, mostPopular, highestRated, recommendations, isLoading } = this.state;

    if (isLoading) {
      return <Text style={{fontSize: 30, color: 'white'}}>Searching...</Text>
    } else if (selectedMovie) {
      return (
        <MovieDetail
          movie={selectedMovie}
          onClose={() => this.setState({selectedMovie: null})}
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
          {this.renderTrendingMovie()}
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