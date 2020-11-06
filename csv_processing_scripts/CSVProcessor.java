import java.io.*;
import com.opencsv.CSVReader;
import java.sql.*;
import java.util.*;

public class CSVProcessor {
    public static final String JDBC_DRIVER = "org.postgresql.Driver"; // Driver for PostgreSQL
    public static final String DB_URL = "jdbc:postgresql://localhost:5432/postgres"; // Database location
    public static final String USER = "postgres"; // username
    public static final String PASS = "Jasky981013#"; // password

    // Native JDBC connection to PostgreSQL
    private static void updateTable(String statement) {
        Connection conn = null;
        Statement stmt = null;

        try{
            //Register JDBC driver
            Class.forName(JDBC_DRIVER);

            //Open a connection
            conn = DriverManager.getConnection(DB_URL,USER,PASS);

            //Execute a query
            stmt = conn.createStatement();
            stmt.execute(statement);

            //Clean-up environment
            stmt.close();
            conn.close();
        }
        catch(Exception e){
            e.printStackTrace();
        }
        finally{
            //finally block used to close resources
            try{
                if(stmt!=null)
                    stmt.close();
            }
            catch(SQLException se2){
            }// nothing we can do

            try{
                if(conn!=null)
                    conn.close();
            }
            catch(SQLException se){
                se.printStackTrace();
            }
        }
    }

    // Finished, Populate studio and movie_studio tables
    public static void processStudioTable() {
        CSVReader reader;

        try {
            // CSV Reader
            reader = new CSVReader(new FileReader("movies_metadata.csv"));
            reader.readNext();
            String[] movie;
            HashMap<Integer, String> studio_map = new HashMap<>();
            HashMap<Integer, HashSet<Integer>> production_map = new HashMap<>();
            while((movie = reader.readNext()) != null) {
                int id = Integer.parseInt(movie[5]);
                String studios = movie[12]; // Format: [{'name': 'Nut Bucket Films', 'id': 62512}, {'name': 'Maxine Street Productions', 'id': 85392}]

                studios = studios.replace('{', ' ').replace('}', ' ').replace('[', ' ').replace(']',' ')
                        .replace('\'', ' ').replace('"', ' ');
                studios = studios.trim();
                if(studios.length() > 0) {
                    String[] studio_list = studios.split(",");
                    int index = 0;
                    while(studio_list.length - index >= 2) {
                        String stud_name = studio_list[index++];
                        stud_name = stud_name.substring(stud_name.indexOf(':') + 1).trim();

                        String stud_id = studio_list[index++];
                        stud_id = stud_id.substring(stud_id.indexOf(':') + 1).trim();

                        if(!stud_id.matches("\\d+")) continue;

                        int studio_id = Integer.parseInt(stud_id);

                        if(!studio_map.containsKey(studio_id))
                            studio_map.put(studio_id, stud_name);

                        if(!production_map.containsKey(id))
                            production_map.put(id, new HashSet<>());
                        production_map.get(id).add(studio_id);
                    }
                }
            }

            for(int i: studio_map.keySet()) {
                StringBuilder sb = new StringBuilder();
                sb.append("INSERT INTO moviedb.studio(id, name) VALUES (");
                sb.append(i + ", ");
                sb.append("'" + studio_map.get(i) + "');");
                updateTable(sb.toString());
            }

            for(int i: production_map.keySet()) {
                HashSet<Integer> temp = production_map.get(i);
                for(int j: temp) {
                    if(studio_map.containsKey(j)) {
                        StringBuilder sb = new StringBuilder();
                        sb.append("INSERT INTO moviedb.movie_studio(movie_id, studio_id) VALUES (");
                        sb.append(i + ", ");
                        sb.append(j + ");");
                        updateTable(sb.toString());
                    }
                }
            }
        }
        catch(Exception e) {
            e.printStackTrace();
        }
    }

    // Finished, populate movie table
    public static void processMovieTable() {
        CSVReader reader;

        try {
            // CSV Reader
            reader = new CSVReader(new FileReader("movies_metadata.csv"));
            reader.readNext();
            String[] movie;
            while((movie = reader.readNext()) != null) {
                StringBuilder sb = new StringBuilder();
                sb.append( "INSERT INTO moviedb.movie(id, overview, tagline, title, language, poster_url, runtime, revenue, budget, popularity, vote_avg, vote_count, release_date) ");
                sb.append("VALUES (");
                sb.append(movie[5] + ", ");         // ID
                sb.append("'" + movie[9].replace('\'', ' ') + "', ");  // Overview
                sb.append("'" + movie[19].replace('\'', ' ') + "', "); // Tagline
                sb.append("'" + movie[20].replace('\'', ' ') + "', "); // Title
                sb.append("'" + movie[7] + "', ");  // Language
                sb.append("'" + movie[11] + "', "); // Poster_url
                sb.append(movie[16] + ", ");        // Runtime
                sb.append(movie[15] + ", ");        // Revenue
                sb.append(movie[2] + ", ");         // Budget
                sb.append(movie[10] + ", ");        // Popularity
                sb.append(movie[22] + ", ");        // Vote_avg
                sb.append(movie[23] + ", ");        // Vote_count
                sb.append("'" + movie[14] + "');"); // Release_date

                // Add into the movie database
                updateTable(sb.toString());
            }
        }
        catch(Exception e) {
            e.printStackTrace();
        }
    }

    // Finished, populate genre and movie_genre tables
    public static void processGenreTable() {
        CSVReader reader;

        try {
            // CSV Reader
            reader = new CSVReader(new FileReader("movies_metadata.csv"));
            reader.readNext();
            String[] movie;
            HashMap<Integer, String> genre_map = new HashMap<>();
            HashMap<Integer, HashSet<Integer>> belonging_map = new HashMap<>();
            while((movie = reader.readNext()) != null) {
                int id = Integer.parseInt(movie[5]);
                String genres = movie[3]; // Format: [{'id': 12, 'name': 'Adventure'}, {'id': 28, 'name': 'Action'}, {'id': 878, 'name': 'Science Fiction'}]

                genres = genres.replace('{', ' ').replace('}', ' ').replace('[', ' ').replace(']',' ')
                        .replace('\'', ' ').replace('"', ' ');
                genres = genres.trim();
                if(genres.length() > 0) {
                    String[] studio_list = genres.split(",");
                    int index = 0;
                    while(studio_list.length - index >= 2) {
                        String genre_id = studio_list[index++];
                        genre_id = genre_id.substring(genre_id.indexOf(':') + 1).trim();

                        String genre_name = studio_list[index++];
                        genre_name = genre_name.substring(genre_name.indexOf(':') + 1).trim();

                        if(!genre_id.matches("\\d+")) continue;

                        int final_id = Integer.parseInt(genre_id);

                        if(!genre_map.containsKey(final_id))
                            genre_map.put(final_id, genre_name);

                        if(!belonging_map.containsKey(id))
                            belonging_map.put(id, new HashSet<>());
                        belonging_map.get(id).add(final_id);
                    }
                }
            }

            for(int i: genre_map.keySet()) {
                StringBuilder sb = new StringBuilder();
                sb.append("INSERT INTO moviedb.genre(id, name) VALUES (");
                sb.append(i + ", ");
                sb.append("'" + genre_map.get(i) + "');");
                updateTable(sb.toString());
            }

            for(int i: belonging_map.keySet()) {
                HashSet<Integer> temp = belonging_map.get(i);
                for(int j: temp) {
                    if(genre_map.containsKey(j)) {
                        StringBuilder sb = new StringBuilder();
                        sb.append("INSERT INTO moviedb.movie_genre(movie_id, genre_id) VALUES (");
                        sb.append(i + ", ");
                        sb.append(j + ");");
                        updateTable(sb.toString());
                    }
                }
            }
        }
        catch(Exception e) {
            e.printStackTrace();
        }
    }

    // Finished
    public static void processCollectionTable() {
        CSVReader reader;

        try {
            // CSV Reader
            reader = new CSVReader(new FileReader("movies_metadata.csv"));
            reader.readNext();
            String[] movie;
            HashMap<Integer, String> collection_map = new HashMap<>();
            HashMap<Integer, String> poster_map = new HashMap<>();
            HashMap<Integer, String> backdrop_map = new HashMap<>();
            HashMap<Integer, HashSet<Integer>> belonging_map = new HashMap<>();
            while((movie = reader.readNext()) != null) {
                int id = Integer.parseInt(movie[5]);
                String collections = movie[1]; // Format: {'id': 137697, 'name': 'Finding Nemo Collection', 'poster_path': '/xwggrEugjcJDuabIWvK2CpmK91z.jpg', 'backdrop_path': '/2hC8HHRUvwRljYKIcQDMyMbLlxz.jpg'}

                collections = collections.replace('{', ' ').replace('}', ' ').replace('[', ' ').replace(']',' ')
                        .replace('\'', ' ').replace('"', ' ');
                collections = collections.trim();
                if(collections.length() > 0) {
                    String[] collection_list = collections.split(",");
                    int index = 0;
                    while(collection_list.length - index >= 4) {
                        String collection_id = collection_list[index++];
                        collection_id = collection_id.substring(collection_id.indexOf(':') + 1).trim();

                        String collection_name = collection_list[index++];
                        collection_name = collection_name.substring(collection_name.indexOf(':') + 1).trim();

                        String poster_url = collection_list[index++];
                        poster_url = poster_url.substring(poster_url.indexOf(':') + 1).trim();
                        if(poster_url.length() <= 10) poster_url = "";

                        String backdrop_url = collection_list[index++];
                        backdrop_url = backdrop_url.substring(backdrop_url.indexOf(':') + 1).trim();
                        if(backdrop_url.length() <= 10) backdrop_url = "";

                        if(!collection_id.matches("\\d+")) continue;

                        int final_id = Integer.parseInt(collection_id);

                        if(!collection_map.containsKey(final_id))
                            collection_map.put(final_id, collection_name);

                        if(!poster_map.containsKey(final_id))
                            poster_map.put(final_id, poster_url);

                        if(!backdrop_map.containsKey(final_id))
                            backdrop_map.put(final_id, backdrop_url);

                        if(!belonging_map.containsKey(id))
                            belonging_map.put(id, new HashSet<>());
                        belonging_map.get(id).add(final_id);
                    }
                }
            }

            for(int i: collection_map.keySet()) {
                StringBuilder sb = new StringBuilder();
                sb.append("INSERT INTO moviedb.collection(id, name, poster_url, backdrop_url) VALUES (");
                sb.append(i + ", ");
                sb.append("'" + collection_map.get(i) + "', ");
                sb.append("'" + poster_map.get(i) + "', ");
                sb.append("'" + backdrop_map.get(i) + "')");
                updateTable(sb.toString());
            }

            for(int i: belonging_map.keySet()) {
                HashSet<Integer> temp = belonging_map.get(i);
                for(int j: temp) {
                    if(collection_map.containsKey(j)) {
                        StringBuilder sb = new StringBuilder();
                        sb.append("INSERT INTO moviedb.movie_collection(movie_id, collection_id) VALUES (");
                        sb.append(i + ", ");
                        sb.append(j + ");");
                        updateTable(sb.toString());
                    }
                }
            }
        }
        catch(Exception e) {
            e.printStackTrace();
        }
    }

    // Finished, populate keyword and movie_keyword tables
    public static void processKeywordTable() {
        CSVReader reader;

        try {
            // CSV Reader
            reader = new CSVReader(new FileReader("keywords.csv"));
            reader.readNext();
            String[] movie;
            HashMap<Integer, String> keyword_map = new HashMap<>();
            HashMap<Integer, HashSet<Integer>> belonging_map = new HashMap<>();
            while((movie = reader.readNext()) != null) {
                int id = Integer.parseInt(movie[0]);
                String keywords = movie[1]; // Format: [{'id': 931, 'name': 'jealousy'}, {'id': 4290, 'name': 'toy'}, {'id': 5202, 'name': 'boy'}, {'id': 6054, 'name': 'friendship'}, {'id': 9713, 'name': 'friends'}, {'id': 9823, 'name': 'rivalry'}, {'id': 165503, 'name': 'boy next door'}, {'id': 170722, 'name': 'new toy'}, {'id': 187065, 'name': 'toy comes to life'}]

                keywords = keywords.replace('{', ' ').replace('}', ' ').replace('[', ' ').replace(']',' ')
                        .replace('\'', ' ').replace('"', ' ');
                keywords = keywords.trim();
                if(keywords.length() > 0) {
                    String[] keyword_list = keywords.split(",");
                    int index = 0;
                    while(keyword_list.length - index >= 2) {
                        String keyword_id = keyword_list[index++];
                        keyword_id = keyword_id.substring(keyword_id.indexOf(':') + 1).trim();

                        String keyword_name = keyword_list[index++];
                        keyword_name = keyword_name.substring(keyword_name.indexOf(':') + 1).trim();

                        if(!keyword_id.matches("\\d+")) continue;

                        int final_id = Integer.parseInt(keyword_id);

                        if(!keyword_map.containsKey(final_id))
                            keyword_map.put(final_id, keyword_name);

                        if(!belonging_map.containsKey(id))
                            belonging_map.put(id, new HashSet<>());
                        belonging_map.get(id).add(final_id);
                    }
                }
            }

            for(int i: keyword_map.keySet()) {
                StringBuilder sb = new StringBuilder();
                sb.append("INSERT INTO moviedb.keyword(id, name) VALUES (");
                sb.append(i + ", ");
                sb.append("'" + keyword_map.get(i) + "');");
                updateTable(sb.toString());
            }

            for(int i: belonging_map.keySet()) {
                HashSet<Integer> temp = belonging_map.get(i);
                for(int j: temp) {
                    if(keyword_map.containsKey(j)) {
                        StringBuilder sb = new StringBuilder();
                        sb.append("INSERT INTO moviedb.movie_keyword(movie_id, keyword_id) VALUES (");
                        sb.append(i + ", ");
                        sb.append(j + ");");
                        updateTable(sb.toString());
                    }
                }
            }
        }
        catch(Exception e) {
            e.printStackTrace();
        }
    }

    // Finished, populate actor and movie_cast tables
    public static void processCastTable() {
        CSVReader reader;

        try {
            // CSV Reader
            reader = new CSVReader(new FileReader("credits.csv"));
            reader.readNext();
            String[] movie;

            HashMap<Integer, String> name_map = new HashMap<>();
            HashMap<Integer, String> url_map = new HashMap<>();
            HashMap<Integer, HashSet<Integer>> belonging_map = new HashMap<>();
            HashMap<Integer, HashMap<Integer, String>> movie_cast_character_map = new HashMap<>();
            HashMap<Integer, HashMap<Integer, Integer>> movie_cast_order_map = new HashMap<>();

            while((movie = reader.readNext()) != null) {
                int id = Integer.parseInt(movie[2]);
                String casts = movie[0]; // Format: [{'cast_id': 14, 'character': 'Woody (voice)', 'credit_id': '52fe4284c3a36847f8024f95', 'gender': 2, 'id': 31, 'name': 'Tom Hanks', 'order': 0, 'profile_path': '/pQFoyx7rp09CJTAb932F2g8Nlho.jpg'}]

                casts = casts.replace('{', ' ').replace('}', ' ').replace('[', ' ').replace(']',' ')
                        .replace('\'', ' ').replace('"', ' ');
                casts = casts.trim();

                if(casts.length() > 0) {
                    String[] cast_list = casts.split(",");
                    int index = 0;
                    while(cast_list.length - index >= 8) {
                        // Not used
                        String raw_cast_id = cast_list[index++];
                        raw_cast_id = raw_cast_id.substring(raw_cast_id.indexOf(':') + 1).trim();

                        String raw_character_name = cast_list[index++];
                        raw_character_name = raw_character_name.substring(raw_character_name.indexOf(':') + 1).trim();

                        // Not used
                        String raw_credit_id = cast_list[index++];
                        raw_credit_id = raw_credit_id.substring(raw_credit_id.indexOf(':') + 1).trim();

                        // Not used
                        String raw_gender = cast_list[index++];
                        raw_gender = raw_gender.substring(raw_gender.indexOf(':') + 1).trim();

                        String raw_actual_id = cast_list[index++];
                        raw_actual_id = raw_actual_id.substring(raw_actual_id.indexOf(':') + 1).trim();

                        String raw_cast_name = cast_list[index++];
                        raw_cast_name = raw_cast_name.substring(raw_cast_name.indexOf(':') + 1).trim();

                        String raw_cast_order = cast_list[index++];
                        raw_cast_order  = raw_cast_order.substring(raw_cast_order.indexOf(':') + 1).trim();

                        String raw_cast_url = cast_list[index++];
                        raw_cast_url  = raw_cast_url.substring(raw_cast_url.indexOf(':') + 1).trim();

                        if(!raw_actual_id.matches("\\d{1,9}")) continue;
                        if(!raw_cast_order.matches("\\d{1,7}")) continue;
                        if(raw_cast_name.matches("None") || raw_cast_name.charAt(0) == '/') continue;
                        if(raw_cast_url.length() < 10) raw_cast_url = "";
                        if(!raw_cast_url.matches("") && raw_cast_url.charAt(0) != '/') continue;

                        int final_cast_id = Integer.parseInt(raw_actual_id);
                        int final_cast_order = Integer.parseInt(raw_cast_order);

                        if(!name_map.containsKey(final_cast_id))
                            name_map.put(final_cast_id, raw_cast_name);

                        if(!url_map.containsKey(final_cast_id))
                            url_map.put(final_cast_id, raw_cast_url);

                        if(!belonging_map.containsKey(id))
                            belonging_map.put(id, new HashSet<>());
                        belonging_map.get(id).add(final_cast_id);

                        if(!movie_cast_character_map.containsKey(id))
                            movie_cast_character_map.put(id, new HashMap<>());
                        movie_cast_character_map.get(id).put(final_cast_id, raw_character_name);

                        if(!movie_cast_order_map.containsKey(id))
                            movie_cast_order_map.put(id, new HashMap<>());
                        movie_cast_order_map.get(id).put(final_cast_id, final_cast_order);
                    }
                }
            }

            for(int i : name_map.keySet()) {
                StringBuilder sb = new StringBuilder();
                sb.append("INSERT INTO moviedb.actor(id, name, profile_url) VALUES (");
                sb.append(i + ", ");
                sb.append("'" + name_map.get(i) + "', ");
                sb.append("'" + url_map.get(i) + "');");
                updateTable(sb.toString());
            }

            for(int i: movie_cast_order_map.keySet()) {
                for(int j: movie_cast_order_map.get(i).keySet()) {
                    if(name_map.containsKey(j)) {
                        StringBuilder sb = new StringBuilder();
                        sb.append("INSERT INTO moviedb.movie_cast(movie_id, actor_id, \"order\", \"character\") VALUES (");
                        sb.append(i + ", ");
                        sb.append(j + ", ");
                        sb.append(movie_cast_order_map.get(i).get(j) + ", ");
                        sb.append("'" + movie_cast_character_map.get(i).get(j) + "');");
                        updateTable(sb.toString());
                    }
                }
            }
        }
        catch(Exception e) {
            e.printStackTrace();
        }
    }

    // Finished, populate crew and movie_crew tables
    public static void processCrewTable() {
        CSVReader reader;

        try {
            // CSV Reader
            reader = new CSVReader(new FileReader("credits.csv"));
            reader.readNext();
            String[] movie;

            HashMap<Integer, String> name_map = new HashMap<>();
            HashMap<Integer, String> url_map = new HashMap<>();
            HashMap<Integer, HashSet<Integer>> belonging_map = new HashMap<>();
            HashMap<Integer, HashMap<Integer, String>> movie_crew_job_map = new HashMap<>();

            while((movie = reader.readNext()) != null) {
                int id = Integer.parseInt(movie[2]);
                String crews = movie[1]; // Format:[{'credit_id': '52fe4284c3a36847f8024f49', 'department': 'Directing', 'gender': 2, 'id': 7879, 'job': 'Director', 'name': 'John Lasseter', 'profile_path': '/7EdqiNbr4FRjIhKHyPPdFfEEEFG.jpg'}]

                // 0: credit_id, 1: department, 2: gender, 3: id, 4: job, 5 name, 6 url
                crews = crews.replace('{', ' ').replace('}', ' ').replace('[', ' ').replace(']',' ')
                        .replace('\'', ' ').replace('"', ' ');
                crews = crews.trim();

                if(crews.length() > 0) {
                    String[] crew_list = crews.split(",");
                    int index = 0;
                    while(crew_list.length - index >= 8) {
                        // Not used
                        String raw_credit_id = crew_list[index++];
                        raw_credit_id = raw_credit_id.substring(raw_credit_id.indexOf(':') + 1).trim();

                        // Not used
                        String raw_department_name = crew_list[index++];
                        raw_department_name = raw_department_name.substring(raw_department_name.indexOf(':') + 1).trim();

                        // Not used
                        String raw_gender = crew_list[index++];
                        raw_gender = raw_gender.substring(raw_gender.indexOf(':') + 1).trim();

                        String raw_actual_id = crew_list[index++];
                        raw_actual_id = raw_actual_id.substring(raw_actual_id.indexOf(':') + 1).trim();

                        String raw_job_name = crew_list[index++];
                        raw_job_name = raw_job_name.substring(raw_job_name.indexOf(':') + 1).trim();

                        String raw_crew_name = crew_list[index++];
                        raw_crew_name = raw_crew_name.substring(raw_crew_name.indexOf(':') + 1).trim();

                        String raw_crew_url = crew_list[index++];
                        raw_crew_url  = raw_crew_url.substring(raw_crew_url.indexOf(':') + 1).trim();

                        if(!raw_actual_id.matches("\\d{1,9}")) continue;
                        if(raw_crew_name.matches("None") || raw_crew_name.charAt(0) == '/') continue;
                        if(raw_job_name.charAt(0) == '/') continue;
                        if(raw_crew_url.length() < 10) raw_crew_url = "";
                        if(!raw_crew_url.matches("") && raw_crew_url.charAt(0) != '/') continue;

                        int final_crew_id = Integer.parseInt(raw_actual_id);

                        if(!name_map.containsKey(final_crew_id))
                            name_map.put(final_crew_id, raw_crew_name);

                        if(!url_map.containsKey(final_crew_id))
                            url_map.put(final_crew_id, raw_crew_url);

                        if(!belonging_map.containsKey(id))
                            belonging_map.put(id, new HashSet<>());
                        belonging_map.get(id).add(final_crew_id);

                        if(!movie_crew_job_map.containsKey(id))
                            movie_crew_job_map.put(id, new HashMap<>());
                        movie_crew_job_map.get(id).put(final_crew_id, raw_job_name);
                    }
                }
            }

            for(int i : name_map.keySet()) {
                StringBuilder sb = new StringBuilder();
                sb.append("INSERT INTO moviedb.crew(id, name, profile_url) VALUES (");
                sb.append(i + ", ");
                sb.append("'" + name_map.get(i) + "', ");
                sb.append("'" + url_map.get(i) + "');");
                updateTable(sb.toString());
            }

            for(int i: movie_crew_job_map.keySet()) {
                for(int j: movie_crew_job_map.get(i).keySet()) {
                    if(name_map.containsKey(j)) {
                        StringBuilder sb = new StringBuilder();
                        sb.append("INSERT INTO moviedb.movie_crew(movie_id, crew_id, job) VALUES (");
                        sb.append(i + ", ");
                        sb.append(j + ", ");
                        sb.append("'" + movie_crew_job_map.get(i).get(j) + "');");
                        updateTable(sb.toString());
                    }
                }
            }
        }
        catch(Exception e) {
            e.printStackTrace();
        }
    }

    // Main method to extract information from csv files to designated PostgreSQL database
    public static void main(String[] args) {
        processMovieTable();
        processStudioTable();
        processGenreTable();
        processCollectionTable();
        processKeywordTable();
        processCastTable();
        processCrewTable();
    }
}