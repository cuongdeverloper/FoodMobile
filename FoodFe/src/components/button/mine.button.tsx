import { Pressable, StyleSheet, Text, View } from "react-native"
import AntDesign from '@expo/vector-icons/AntDesign';
interface Props {
    title: string;
    onPress: () => any;
}
const styles = StyleSheet.create({
    text: {
        textTransform: "uppercase"
    },
    btnContainer: {
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        alignSelf: "flex-start"
    }
})
const MineButton = (props: Props) => {
    const { title, onPress } = props;
    return (
        <Pressable
            style={({ pressed }) => ({
                opacity: pressed === true ? 0.5 : 1,
                alignSelf: "flex-start"
            })}
            onPress={onPress}>
            <View style={styles.btnContainer}>
                <AntDesign name="antdesign" size={24} color="black" />   
                <Text style={styles.text}>{title}</Text>     
            </View> 
        </Pressable>
    )
}
export default MineButton