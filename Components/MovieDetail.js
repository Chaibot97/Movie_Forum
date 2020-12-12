import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Button, FlatList, TextInput } from 'react-native';
import { withNavigation } from 'react-navigation';

import { getCommentsByMovieId, postComment } from '../api/dbo';

class MovieDetail extends Component {
  constructor(props) {
    super(props);

    const { movie } = this.props;

    this.state = {
      comments: [],
      isLoading: false,
      newComment: '',
    }
  };

  componentDidMount() {
    this.fetchMovieComments();
  };

  fetchMovieComments = async () => {
    const { movie } = this.props;
    const { id } = movie;

    this.setState({ isLoading: true });
    const comments = await getCommentsByMovieId(id);
    this.setState({ comments, isLoading: false });
  }

  renderMovieComment = (item) => {
    const { email, comment } = item;
    return (
      <View style={{ marginVertical: 15 }}>
        <Text style={{color: '#37a9b8'}}>{email}</Text>
        <Text style={{color: 'white'}}>{comment}</Text>
      </View>
    )
  };

  renderMovieComments = () => {
    const { comments, newComment} = this.state;
    return (
      <View style={{ marginVertical: 15}}>
        <View>
          <Text style={{color: 'white', fontSize: 24}}>Comments</Text>
        </View>
        <FlatList
          data={comments}
          renderItem={({item}) => this.renderMovieComment(item)}
          keyExtractor={(item) => item.id}
        />
        <br/>
        <Text style={{color: 'white'}}>Enter your comments</Text>
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1, backgroundColor: 'white', padding: 5}}
          onChangeText={text => this.setState({ newComment: text })}
          value={newComment}
          multiline = {true}
          numberOfLines = {4}
        />
        <Button
          onPress={this.submitComment}
          title="Comment"
        />
      </View>
    )
  }

  submitComment = async () => {
    const { userName, movie } = this.props;
    const { newComment } = this.state;
    const { id } = movie;
    await postComment(id, userName, newComment);
    this.fetchMovieComments();
  }

  renderMovieDetail = () => {
    const { movie, like, dislike, userLikes } = this.props;
    const { poster_url, title, language, overview, vote_avg,  vote_count, id, actors } = movie;
    const imagePath = `https://image.tmdb.org/t/p/original${poster_url}`;

    let likeThisMovie = false;
    for (let i = 0; i < userLikes.length; i += 1) {
      if (userLikes[i].id === movie.id) {
        likeThisMovie = true;
      }
    }

    // concatenate the actors
    let actorNames = "";
    for (let i = 0; i < actors.length; i += 1) {
      const { name } = actors[i];
      actorNames += name + ", ";
    }
    actorNames = actorNames.substr(0, actorNames.length-2);

    return (
      <>
        <View style={{flexDirection: 'row', marginTop: 20, alignItems: 'flex-start',}}>
          <Image source={{uri: imagePath}} style={{height:600, width: 450, resizeMode: 'cover'}}/>
          <View style={{ width: '50%', marginHorizontal: 30 }}>
            <Text style={{fontWeight: 'bold', fontSize: 24, color: 'white'}}>{title}</Text>
            <br/>
            <Text style={{color: '#37a9b8'}}>Language: {language}</Text>
            <br/>
            <Text style={{color: '#37a9b8'}}>Actors:</Text>
            <Text style={{color: '#37a9b8'}}>{actorNames}</Text>
            <br/>
            <Text style={{color: '#37a9b8'}}>Vote Average: {vote_avg}</Text>
            <br/>
            <Text style={{color: '#37a9b8'}}>Vote Count: {vote_count}</Text>
            <br/>
            <Text style={{color: '#37a9b8'}}>{overview}</Text>
            <br/>
            <View style={{width: 100}}>
              {
                likeThisMovie ? 
                (
                  <Button
                    style={{width: 30}}
                    onPress={() => dislike(movie.id)}
                    color="#f194ff"
                    title="Dislike"
                  />
                ) : (
                  <Button
                    style={{width: 30}}
                    onPress={() => like(movie.id)}
                    title="Like it!"
                  />
                )
              }
            </View>
          </View>
        </View>
        {this.renderMovieComments()}
      </>
    )
  };

  render() {
    const { movie, onClose } = this.props;
    const { poster_url, title, language, overview, vote_avg,  vote_count} = movie;
    const imagePath = `https://image.tmdb.org/t/p/original${poster_url}`;

    return (
      <View style={styles.container}>
        <View>
          <Button 
            onPress={onClose}
            title="Go Back"
          />
        </View>
        {this.renderMovieDetail()}
      </View>
    )
  }

};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    padding: 20,
    width: '100%',
    height: '100%'
  },
  movieDetail: {
    flexDirection: 'column'
  }
})

export default withNavigation(MovieDetail);