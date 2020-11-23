import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, Image } from 'react-native';

class MovieList extends Component {
  constructor(props) {
    super(props);

    const { movie, onMovieSelected, isHorizontal } = props;
    this.state = {
      validMovies: [],
      isLoading: false
    };
  }

  componentDidMount() {
    this.addValidMovies();
  }

  // add movies with valid url to the list
  addValidMovies = async () => {
    // start loading screen
    this.setState({isLoading: true});

    // check movies
    const { movies } = this.props;
    const validMovies = [];
    for (let i = 0; i < movies.length; i += 1) {
      const movie = movies[i];
      const { poster_url } = movie;
    
      if (poster_url) {
        const imageUri = `https://image.tmdb.org/t/p/original${poster_url}`;
        const res = await fetch(imageUri);
        if (res.status !== 404) {
          console.log(res);
          validMovies.push(movie);
        }

        if (validMovies.length === 10) {
          break;
        }
      }
    }

    // update the state
    this.setState({isLoading: false, validMovies});
  };

  renderMovieVertical = (movie) => {
    // extract the detail information
    const { poster_url, homepage, title, director, actors, rating, genres, language } = movie;

    // call back function
    const { onMovieSelected } = this.props;

    // build image path
    const imagePath = `https://image.tmdb.org/t/p/original${poster_url}`;

    // render the movie
    return (
      <View style={[styles.movieCard]}>
        <TouchableOpacity onPress={() => onMovieSelected(movie)}>
          <Image source={{uri: imagePath}} style={{height: 450, width: 300, resizeMode: 'cover'}}/>
        </TouchableOpacity>
        <View style={{paddingLeft: 20, paddingVertical: 10}}>
          <Text style={{fontWeight: 'bold', fontSize: 18, color: '#37a9b8'}}>{title}</Text>
          <Text style={{color: '#37a9b8'}}>language: {language}</Text>
        </View>
      </View>
    )
  };

  renderMovieHorizontal = (movie) => {
    // extract the detail information
    const { poster_url, homepage, title, director, actors, rating, genres, language } = movie;

    // call back function
    const { onMovieSelected } = this.props;

    // build image path
    const imagePath = `https://image.tmdb.org/t/p/original${poster_url}`;

    // render the movie
    return (
      <View style={[styles.movieCard, {flexDirection: 'row'}]}>
        <TouchableOpacity onPress={() => onMovieSelected(movie)}>
          <Image 
            source={{uri: imagePath}}
            style={{height: 450, width: 300, resizeMode: 'cover'}}
          />
        </TouchableOpacity>
        <View style={{paddingLeft: 20, paddingVertical: 10}}>
          <Text style={{fontWeight: 'bold', fontSize: 18, color: '#37a9b8'}}>{title}</Text>
          <Text style={{color: '#37a9b8'}}>language: {language}</Text>
        </View>
      </View>
    )
  };

  renderList = () => {
    const { validMovies, isLoading } = this.state;
    const { isHorizontal } = this.props;

    if (isLoading) {
      return <Text style={{fontSize: 20, color: 'white'}}>Validating...</Text>
    }
    return (
      <FlatList
        horizontal={isHorizontal}
        data={validMovies}
        renderItem={({item}) => isHorizontal ? this.renderMovieVertical(item) : this.renderMovieHorizontal(item)}          keyExtractor={item => item.id}
      />
    )
  }

  render() {
    return (
      <View style={styles.movieCard}>
        {this.renderList()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  movieCard: {
    padding: 20,
  }
});

export default MovieList;

