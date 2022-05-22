import styles from "./App.module.css";
import List from "./component/List";
import InputWithLabel from "./component/InputWithLabel";
import logo from "./logo.svg";
import usePersistence from "./hooks/usePersistence";
import React, {
  useEffect,
  useMemo,
  useReducer,
  useCallback,
  createContext,
  useState,
} from "react";
import axios from "axios";
import { useDebounce } from "./hooks/useDebounce";
import { StateType, StoryType, ActionType } from "./types";
import { Link } from "react-router-dom";
import { Box } from "@mui/system";
import { Button, Paper } from "@mui/material";
import Pagenumbers from "./component/Pagenumbers";
import Pages from "./Pages.json"
import InfiniteScroll from "react-infinite-scroll-component";

export const title: string = "React Training";

export function storiesReducer(state: StateType, action: ActionType) {
  switch (action.type) {
    case "SET_STORIES":
      return { data: action.payload.data, isError: false, isLoading: false };
    case "INIT_FETCH":
      return { ...state, isLoading: true, isError: false };
    case "FETCH_FAILURE":
      return { ...state, isLoading: false, isError: true };
    case "REMOVE_STORY":
      const filteredState = state.data.filter(
        (story: any) => story.objectID !== action.payload.id
      );
      return { data: filteredState, isError: false, isLoading: false };
    default:
      return state;
  }
}

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";
const API = "https://hn.algolia.com/api/v1/search?page=";
interface AppContextType {
  onClickDelete: (e: number) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

function App(): JSX.Element {
  const [hasMore, sethasMore] = useState(true);
  const [searchText, setSearchText] = usePersistence("searchTerm", "React");
  const [pagenumber, setPagenumber] =  useState(1);
  const Pageurl= useDebounce(API + pagenumber);
  const debouncedUrl = useDebounce(API_ENDPOINT + searchText);
  const [stories, dispatchStories] = useReducer(storiesReducer, {
    data: [],
    isError: false,
    isLoading: false,
  });
  

  console.log(stories.data);

  const sumOfComments = useMemo(
    () =>
      stories.data.reduce(
        (acc: number, current: StoryType) => acc + current.num_comments,
        0
      ),
    [stories]
  );

  const handleFetchStories = useCallback(async () => {
    dispatchStories({ type: "INIT_FETCH" });
    try {
      const response = await axios.get(debouncedUrl);
      dispatchStories({
        type: "SET_STORIES",
        payload: { data: response.data.hits },
      });
    } catch {
      dispatchStories({ type: "FETCH_FAILURE" });
    }
  }, [debouncedUrl]);



  useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);


  const handlepageurl = useCallback(async () => {
    dispatchStories({ type: "INIT_FETCH" });
    try {
      const response = await axios.get(Pageurl);
      dispatchStories({
        type: "SET_STORIES",
        payload: { data: response.data.hits },
      });
    } catch {
      dispatchStories({ type: "FETCH_FAILURE" });
    }
  }, [Pageurl]);



  useEffect(() => {
    handlepageurl();
  }, [handlepageurl]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchText(event.target.value);
  }



  const handleDeleteClick = useCallback((objectId: number) => {
    console.log("Delete click captured", objectId);
    dispatchStories({ type: "REMOVE_STORY", payload: { id: objectId } });
  },[]);

  if (stories.isError) {
    return (
      <h1 style={{ marginTop: "10rem", color: " red" }}>
        Something went wrong
      </h1>
    );
  }

  

  const fetchnewdata = async () => {
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search?page=${pagenumber}`);
    const data = await res.json();
    return data.hits;
  };


  const fetchData = async () => {
    const extradata = await fetchnewdata();

    dispatchStories({
      type: "SET_STORIES",
      payload: { data:[...stories.data,...extradata]},
    });
    
    if (extradata.length==0||extradata.length<20)
    {sethasMore(false);}
    setPagenumber(pagenumber + 1);
  };

  return (
    <div>
      <nav>
        <div className={styles.heading}>
          <h1>{title}</h1>
          <img src={logo} />
        </div>
        <p>Sum: {sumOfComments}</p>
        <InputWithLabel
          searchText={searchText}
          onChange={handleChange}
          id="searchBox"
        >
          Search
        </InputWithLabel>
        <Link to="/login" state={{ id: "1234" }}>
          <h6>Login</h6>
        </Link>
      </nav>
      {stories.isLoading ? (
        <h1 style={{ marginTop: "10rem" }}>Loading</h1>
      ) : (
        <div>
        <AppContext.Provider value={{ onClickDelete: handleDeleteClick }}>
            <InfiniteScroll
          dataLength={stories.data.length}
          next={fetchData}
          hasMore={hasMore}
          loader={<h1></h1>}
          endMessage={<h1>End.....</h1>}
        >
        <List listOfItems={stories.data} />
        </InfiniteScroll>
        </AppContext.Provider>
        </div>
      )}
    </div>
  );
}

export default App;