from googletrans import Translator

translator = Translator()
result = translator.translate("Hello, how are you?", dest="es")
print(result.text)  # Output: "Hola, ¿cómo estás?"
