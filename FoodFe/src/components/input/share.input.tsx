import { useState } from "react";
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from "react-native"
import FontAwesome from '@expo/vector-icons/FontAwesome';
const styles = StyleSheet.create({
    inputGroup: {
        padding: 5,
        gap: 10
    },
    text: {
        fontSize: 20,
        fontWeight: "600"
    },
    input: {
        borderColor: "green",
        borderWidth: 1,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 5
    },
    eye:{
        position:'absolute',
        right:4,
        top:40
    }
})
interface IProps {
    title?: string;
    keyboardType?: KeyboardTypeOptions;
    secureTextEntry?: boolean;
    value?: any;
    setValue?: (v:any) => void;
    onChangeText?: any;
    onBlur?:any;
    error?: any;
}
const ShareInput = (props: IProps) => {
    const { title, keyboardType, secureTextEntry = false,
        value,setValue,onChangeText,onBlur,error
     } = props;
    const [isFocus, setIsFocus] = useState<boolean>(false);
    const [isShowPassword,setIsShowPassword] = useState<boolean>(false);
    return (
        <View style={styles.inputGroup}>
            <View>
                {title && <Text style={styles.text}>{title}</Text>}
                <TextInput
                    value={value}
                    onFocus={() => setIsFocus(true)}
                    onBlur={(e) => {if(onBlur) onBlur(e); setIsFocus(false)}}
                    style={[styles.input, { borderColor: isFocus ? "orange" : "green" }]}
                    keyboardType={keyboardType}
                    secureTextEntry={secureTextEntry && !isShowPassword}

                    onChangeText={onChangeText}
                />
                {error && <Text>{error}</Text>}
                {secureTextEntry && 
                <FontAwesome 
                style={styles.eye} 
                name={isShowPassword ? "eye" : "eye-slash"} size={15} color="black" 
                onPress={()=> setIsShowPassword(!isShowPassword)}/>}
                
            </View>

        </View>
    )
}
export default ShareInput