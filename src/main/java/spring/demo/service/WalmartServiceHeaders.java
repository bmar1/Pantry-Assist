package spring.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;

@Service
public class WalmartServiceHeaders {
    private final String keyVersion = "1";


    @Value("${walmart.id}")
    private String consumerId;

    @Value("${walmart.key}")
    private String keyContent;


    // 1. Consumer ID
    public String getWMConsumerId() {
        return consumerId;
    }

    // 2. Key version
    public String getWMSecKeyVersion() {
        return keyVersion;
    }

    // 3. Timestamp (milliseconds)
    public String getWMConsumerIntimestamp() {
        return String.valueOf(System.currentTimeMillis());
    }

    // 4. Auth signature
    public String getWMSecAuthSignature(String timestamp) throws Exception {
        String message = consumerId + "\n" + timestamp + "\n" + keyVersion + "\n";


        byte[] keyBytes = Base64.getDecoder().decode(keyContent);

        // Rebuild private key
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        PrivateKey privateKey = KeyFactory.getInstance("RSA").generatePrivate(spec);

        // Sign with SHA256withRSA
        Signature sig = Signature.getInstance("SHA256withRSA");
        sig.initSign(privateKey);
        sig.update(message.getBytes(StandardCharsets.UTF_8));
        byte[] signed = sig.sign();

        return Base64.getEncoder().encodeToString(signed);
    }


}
