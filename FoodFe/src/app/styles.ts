import {StyleSheet} from "react-native";

export default StyleSheet.create({
  container: {
    backgroundColor: "#ecf0f1",
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
    // marginTop:50
  },
  header: {
    borderColor: "red",
    borderWidth: 5,
    height: 100,
    // marginBottom: 6,
    width: "100%"
  },
  item: {
    borderColor: "green",
    borderWidth: 5,
    height: 100,
    marginBottom: 6,
    width: "100%"
  },
  list: {
    overflow: "hidden"
  },
  sticky: {
    backgroundColor: "#2555FF50",
    borderColor: "blue",
    borderWidth: 5,
    height: 100,
    marginBottom: 6,
    width: "100%"
  },
  topList: {
    borderColor: "orange",
    borderWidth: 5,
    height: 100,
    marginBottom: 6,
    width: "100%"
  }
});