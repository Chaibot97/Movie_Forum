import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, Picker, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SearchBar } from 'react-native-elements';

import MovieCard from '../Components/MovieCard';
import MovieDetail from '../Components/MovieDetail';

class MainScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      topic: 'topPick',
      selectedMovie: null,
      movies: [{
        id: 1,
        imageUri: '/7G9915LfUQ2lVfwMEEhDsn3kT4B.jpg',
        backdropPath: '/9FBwqcd9IRruEDUrTdcaafOMKUq.jpg',
        title: 'Toy Story Collection',
        language: 'english'
      },{
        id: 2,
        imageUri: '/7G9915LfUQ2lVfwMEEhDsn3kT4B.jpg',
        backdropPath: '/9FBwqcd9IRruEDUrTdcaafOMKUq.jpg',
        title: 'Toy Story Collection',
        language: 'english'
      },{
        id: 3,
        imageUri: '/7G9915LfUQ2lVfwMEEhDsn3kT4B.jpg',
        backdropPath: '/9FBwqcd9IRruEDUrTdcaafOMKUq.jpg',
        title: 'Toy Story Collection',
        language: 'english'
      },{
        id: 4,
        imageUri: '/7G9915LfUQ2lVfwMEEhDsn3kT4B.jpg',
        backdropPath: '/9FBwqcd9IRruEDUrTdcaafOMKUq.jpg',
        title: 'Toy Story Collection',
        language: 'english'
      },{
        id: 5,
        imageUri: '/7G9915LfUQ2lVfwMEEhDsn3kT4B.jpg',
        backdropPath: '/9FBwqcd9IRruEDUrTdcaafOMKUq.jpg',
        title: 'Toy Story Collection',
        language: 'english'
      },{
        id: 6,
        imageUri: '/7G9915LfUQ2lVfwMEEhDsn3kT4B.jpg',
        backdropPath: '/9FBwqcd9IRruEDUrTdcaafOMKUq.jpg',
        title: 'Toy Story Collection',
        language: 'english'
      }],
      recommendations: 
      [{
        id: 1,
        imageUri: '/nauCllomdtyciLCRcVrSJKcJQbn.jpg',
        backdropPath: '/9FBwqcd9IRruEDUrTdcaafOMKUq.jpg',
        title: 'Mortal Kombat Collection',
        language: 'english'
      },{
        id: 2,
        imageUri: '/nauCllomdtyciLCRcVrSJKcJQbn.jpg',
        backdropPath: '/9FBwqcd9IRruEDUrTdcaafOMKUq.jpg',
        title: 'Mortal Kombat Collection',
        language: 'english'
      },{
        id: 3,
        imageUri: '/nauCllomdtyciLCRcVrSJKcJQbn.jpg',
        backdropPath: '/9FBwqcd9IRruEDUrTdcaafOMKUq.jpg',
        title: 'Mortal Kombat Collection',
        language: 'english'
      },{
        id: 4,
        imageUri: '/nauCllomdtyciLCRcVrSJKcJQbn.jpg',
        backdropPath: '/9FBwqcd9IRruEDUrTdcaafOMKUq.jpg',
        title: 'Mortal Kombat Collection',
        language: 'english'
      },{
        id: 5,
        imageUri: '/nauCllomdtyciLCRcVrSJKcJQbn.jpg',
        backdropPath: '/9FBwqcd9IRruEDUrTdcaafOMKUq.jpg',
        title: 'Mortal Kombat Collection',
        language: 'english'
      },{
        id: 6,
        imageUri: '/nauCllomdtyciLCRcVrSJKcJQbn.jpg',
        backdropPath: '/9FBwqcd9IRruEDUrTdcaafOMKUq.jpg',
        title: 'Mortal Kombat Collection',
        language: 'english'
      }],
    }
  }

  renderSearchIcon = () => {
    return (
      <TouchableOpacity>
        <Image source={require('../assets/search.png')} style={{width: 30, height: 30}}/>
      </TouchableOpacity>
    )
  }

  renderHeader = () => {
    const { topic, selectedMovie } = this.state;

    return (
      <View style={styles.header}>
        <View style={{justifyContent: 'center'}}>
          <Text style={{fontSize: 20, color: 'red'}}>Movie Forum</Text>
        </View>
        <TouchableOpacity
          disabled={selectedMovie !== null}
          style={{paddingHorizontal: 30}} 
          onPress={() => this.setState({topic: 'topPick'})}>
          <Text style={{color: topic === 'topPick' ? '#37a9b8' : 'white' }}>Top Pick</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={selectedMovie !== null}
          style={{paddingHorizontal: 30}} 
          onPress={() => this.setState({topic: 'recommendations'})}>
          <Text style={{color: topic === 'recommendations' ? '#37a9b8' : 'white' }}>Recommendations</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={selectedMovie !== null}
          style={{paddingHorizontal: 30}} 
          onPress={() => this.setState({topic: 'me'})}>
          <Text style={{color: topic === 'me' ? '#37a9b8' : 'white' }}>Me</Text>
        </TouchableOpacity>
        <SearchBar
          searchIcon={this.renderSearchIcon()}
          containerStyle={{flex: 1, backgroundColor: 'black', paddingLeft: 100}}
          placeholder="Type Here..."
          onChangeText={(text) => console.log(text)}
          value={null}
        />
        <Picker selectedValue="movieName" style={{ height: 30, width: 120, color: 'white', backgroundColor: 'black'}}>
          <Picker.Item style={{color: 'white'}} label="Movie Name" value="movieName"/>
          <Picker.Item label="Crew Name" value="crewName"/>
        </Picker>
   
      </View>
    )
  }

  renderMovieCard = (movie) => {
    return (
      <MovieCard
        movie={movie}
        onMovieSelected={(movie) => {
          console.log(movie);
          this.setState({selectedMovie: movie})
        }}
      />
    );
  };

  renderMainSection = (data) => {
    const {selectedMovie} = this.state;

    if (selectedMovie) {
      return (
        <MovieDetail
          movie={selectedMovie}
          closeDetail={() => this.setState({selectedMovie: null})}
        />
      )
    } else {
      return (
        <FlatList
          data={data}
          renderItem={({item}) => this.renderMovieCard(item)}
          keyExtractor={item => item.id}
        />
      )
    }
  }

  render() {
    const { movies, recommendations, topic } = this.state;
    let data = movies;
    if (topic === 'recommendations') {
      data = recommendations;
    } 
    return (
      <View style={styles.container}>
        {this.renderHeader()}
        <ScrollView style={{flex: 1, backgroundColor: 'black'}}>
          {this.renderMainSection(data)}
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