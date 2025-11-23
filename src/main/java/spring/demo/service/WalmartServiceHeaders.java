package spring.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
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

    public String getWMConsumerId() {
        return consumerId;
    }

    public String getWMSecKeyVersion() {
        return keyVersion;
    }

    public String getWMConsumerIntimestamp() {
        return String.valueOf(System.currentTimeMillis());
    }

    public String getWMSecAuthSignature(String timestamp) throws Exception {
        String stringToSign = consumerId + "\n" + timestamp + "\n" + keyVersion + "\n";

        // Sign with private key
        Signature sig = Signature.getInstance("SHA256withRSA");
        sig.initSign(loadKey());
        sig.update(stringToSign.getBytes(StandardCharsets.UTF_8));
        byte[] signedBytes = sig.sign();


        return Base64.getEncoder().encodeToString(signedBytes);
    }

    @Value("classpath:walmart_private_key.pem")
    private Resource privateKeyResource;

    private PrivateKey loadKey() throws Exception {
        String key = new String(privateKeyResource.getInputStream().readAllBytes(), StandardCharsets.UTF_8)
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s+", ""); // remove line breaks
        byte[] decoded = Base64.getDecoder().decode(key);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(decoded);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");

        return keyFactory.generatePrivate(spec);
    }



}
